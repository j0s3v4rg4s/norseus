import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CLIENT_COLLECTION, FACILITY_COLLECTION, ClientModel } from '@models/facility';
import {
  CreateClientRequest,
  CreateClientResponse,
  PROFILE_COLLECTION,
  ProfileModel,
  Role,
} from '@models/user';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { z } from 'zod';
import { checkUserPermission } from '../utilities/permissions';

/**
 * Request schema for creating a client
 */
const CreateClientSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  facilityId: z.string().min(1, 'Facility ID is required'),
});

/**
 * Firebase callable function to create or associate a client with a facility
 * 
 * If the user exists:
 * - Associates them with the facility
 * - Adds USER role if not present
 * 
 * If the user doesn't exist:
 * - Creates Firebase Auth user
 * - Creates profile document
 * - Creates client document
 * - Assigns USER role
 * - Generates password reset link
 */
export const createClient = onCall(async (request): Promise<CreateClientResponse> => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  // 2. Validate input
  const validationResult = CreateClientSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data: CreateClientRequest = validationResult.data;
  const db = getFirestore();
  const auth = getAuth();
  const currentUserId = request.auth.uid;

  const hasPermission = await checkUserPermission(
    db,
    data.facilityId,
    currentUserId,
    PermissionSection.CLIENTS,
    PermissionAction.CREATE,
  );

  if (!hasPermission) {
    throw new HttpsError('permission-denied', 'You do not have permission to create clients');
  }

  try {
    // 4. Try to get user by email
    let userRecord;
    let userExists = false;

    try {
      userRecord = await auth.getUserByEmail(data.email);
      userExists = true;
    } catch (error) {
      if (error instanceof FirebaseAuthError && error.code === 'auth/user-not-found') {
        userExists = false;
      } else {
        throw error;
      }
    }

    const timestamp = Timestamp.fromDate(new Date());

    // 5. Handle existing user
    if (userExists && userRecord) {
      // 5a. Get existing profile
      const profileDoc = await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).get();
      
      if (!profileDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }

      const profileData = profileDoc.data() as ProfileModel;

      // 5b. Check if already a client in this facility
      const clientDoc = await db
        .collection(FACILITY_COLLECTION)
        .doc(data.facilityId)
        .collection(CLIENT_COLLECTION)
        .doc(userRecord.uid)
        .get();

      if (clientDoc.exists) {
        throw new HttpsError('already-exists', 'User is already a client in this facility');
      }

      // 5c. Create client document
      const clientData = {
        uid: userRecord.uid,
        joined: timestamp,
        isActive: true,
        profile: profileData,
      } as ClientModel;

      await db
        .collection(FACILITY_COLLECTION)
        .doc(data.facilityId)
        .collection(CLIENT_COLLECTION)
        .doc(userRecord.uid)
        .set(clientData);

      // 5d. Add USER role if not present
      const currentClaims = (await auth.getUser(userRecord.uid)).customClaims || {};
      const currentRoles = (currentClaims.roles as Role[]) || [];

      if (!currentRoles.includes(Role.USER)) {
        const updatedRoles = [...currentRoles, Role.USER];
        await auth.setCustomUserClaims(userRecord.uid, {
          ...currentClaims,
          roles: updatedRoles,
        });
      }

      return {
        success: true,
        uid: userRecord.uid,
        message: 'Existing user associated with facility as client',
      };
    }

    // 6. Handle new user
    // 6a. Create Firebase Auth user
    userRecord = await auth.createUser({
      email: data.email,
      displayName: data.name,
      emailVerified: false,
    });

    // 6b. Set custom claims with USER role
    await auth.setCustomUserClaims(userRecord.uid, { roles: [Role.USER] });

    // 6c. Create profile document
    const profileData = {
      id: userRecord.uid,
      createdAt: timestamp,
      name: data.name,
      email: data.email,
      img: null,
    } as ProfileModel;

    await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).set(profileData);

    // 6d. Create client document
    const clientData = {
      uid: userRecord.uid,
      joined: timestamp,
      isActive: true,
      profile: profileData,
    } as ClientModel;

    await db
      .collection(FACILITY_COLLECTION)
      .doc(data.facilityId)
      .collection(CLIENT_COLLECTION)
      .doc(userRecord.uid)
      .set(clientData);

    return {
      success: true,
      uid: userRecord.uid,
      message: 'New user created and associated with facility as client',
    };
  } catch (error) {
    // Handle specific Firebase errors
    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof FirebaseAuthError) {
      if (error.code === 'auth/email-already-exists') {
        throw new HttpsError('already-exists', 'Email is already in use by another account');
      }
      if (error.code === 'auth/invalid-email') {
        throw new HttpsError('invalid-argument', 'Invalid email address');
      }
    }

    // Log and throw generic error for unexpected issues
    console.error('Error creating client:', error);
    throw new HttpsError('internal', 'Error creating client');
  }
});
