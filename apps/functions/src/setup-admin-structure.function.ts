import { onRequest } from 'firebase-functions/v2/https';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import cors from 'cors';
import { FacilityModel, EmployeeModel } from '@models/facility';
import { Role, ProfileModel } from '@models/user';

const corsHandler = cors({ origin: true });

const _createUser = async (name: string, role: Role): Promise<UserRecord> => {
  const auth = getAuth();
  const db = getFirestore();

  const email = `${name.replace(/\s+/g, '.').toLowerCase()}@norseus.com`;
  const userRecord = await auth.createUser({
    email,
    password: 'password123',
    displayName: name,
    emailVerified: true,
  });

  await auth.setCustomUserClaims(userRecord.uid, { role });

  const profile: Omit<ProfileModel, 'createdAt' | 'email'> & { createdAt: FieldValue} = {
    createdAt: FieldValue.serverTimestamp(),
    name,
    img: `https://i.pravatar.cc/150?u=${email}`,
  };
  await db.collection('profiles').doc(userRecord.uid).set(profile);

  return userRecord;
};

export const setupAdminStructure = onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    const db = getFirestore();

    try {
      // 1. Create Super Admin
      const superAdmin = await _createUser('Super Admin', Role.SUPER_ADMIN);

      // 2. Create Facility
      const facilityRef = db.collection('facilities').doc();
      const facility: Omit<FacilityModel, 'createdAt'> & { createdAt: FieldValue } = {
        createdAt: FieldValue.serverTimestamp(),
        name: 'Norseus Gym',
        logo: 'https://via.placeholder.com/150',
      };
      await facilityRef.set(facility);

      // 3. Create Facility Admin
      const facilityAdmin = await _createUser('Facility Admin', Role.ADMIN);
      const adminEmployee: Omit<EmployeeModel, 'joined'> & { joined: FieldValue } = {
        uid: facilityAdmin.uid,
        joined: FieldValue.serverTimestamp(),
        roleId: null, // Assign a role if you have a roles collection
        isAdmin: true,
        profile: (await db.collection('profiles').doc(facilityAdmin.uid).get()).data() as ProfileModel,
      };
      await facilityRef.collection('employees').doc(facilityAdmin.uid).set(adminEmployee);

      // 4. Create Facility Employer
      const facilityEmployer = await _createUser('Facility Employer', Role.USER);
      const employerEmployee: Omit<EmployeeModel, 'joined'> & { joined: FieldValue } = {
        uid: facilityEmployer.uid,
        joined: FieldValue.serverTimestamp(),
        roleId: null, // Assign a role if you have a roles collection
        isAdmin: false,
        profile: (await db.collection('profiles').doc(facilityEmployer.uid).get()).data() as ProfileModel,
      };
      await facilityRef.collection('employees').doc(facilityEmployer.uid).set(employerEmployee);

      response.status(201).json({
        message: 'Admin structure created successfully!',
        superAdminId: superAdmin.uid,
        facilityId: facilityRef.id,
        facilityAdminId: facilityAdmin.uid,
        facilityEmployerId: facilityEmployer.uid,
      });
    } catch (error) {
      console.error('Error setting up admin structure:', error);
      response.status(500).send('Internal Server Error');
    }
  });
});
