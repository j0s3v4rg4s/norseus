import { onRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';
import { Role } from '@models/user';

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// Interface for the request body
interface CreateUserRequest {
  email: string;
  name: string;
}

// Interface for the response
interface CreateUserResponse {
  success: boolean;
  message: string;
  userId?: string;
  error?: string;
}

export const createUser = onRequest(async (request, response) => {
  const db = getFirestore();
  const auth = getAuth();

  return corsHandler(request, response, async () => {
    if (request.method !== 'POST') {
      response.status(405).json({
        success: false,
        message: 'Method not allowed. Only POST requests are accepted.',
      });
      return;
    }

    try {
      const { email, name }: CreateUserRequest = request.body;

      if (!email || !name) {
        response.status(400).json({
          success: false,
          message: 'Email and name are required fields.',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        response.status(400).json({
          success: false,
          message: 'Invalid email format.',
        });
        return;
      }

      const userRecord = await auth.createUser({
        email,
        password: '123456',
        displayName: name,
        emailVerified: false,
      });

      auth.setCustomUserClaims(userRecord.uid, { role: Role.ADMIN });

      // Create profile document in Firestore
      const profileData = {
        createdAt: new Date(),
        name: name,
        img: null, // Optional field, set to null initially
      };

      await db.collection('profiles').doc(userRecord.uid).set(profileData);

      const responseData: CreateUserResponse = {
        success: true,
        message: 'User created successfully',
        userId: userRecord.uid,
      };

      response.status(201).json(responseData);
    } catch (error) {
      let errorMessage = 'An error occurred while creating the user';
      let statusCode = 500;

      // Handle specific Firebase Auth errors
      if (error instanceof Error) {
        if (error.message.includes('email-already-exists')) {
          errorMessage = 'A user with this email already exists';
          statusCode = 409;
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Invalid email format';
          statusCode = 400;
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'Password is too weak';
          statusCode = 400;
        }
      }

      const errorResponse: CreateUserResponse = {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      response.status(statusCode).json(errorResponse);
    }
  });
});
