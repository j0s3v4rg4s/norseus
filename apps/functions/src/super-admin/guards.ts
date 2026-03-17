import { HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { Role } from '@models/user';

export async function requireSuperAdmin(uid: string): Promise<void> {
  const auth = getAuth();
  const user = await auth.getUser(uid);
  const roles = (user.customClaims?.roles as string[]) ?? [];
  if (!roles.includes(Role.SUPER_ADMIN)) {
    throw new HttpsError('permission-denied', 'Super administrator permissions required');
  }
}
