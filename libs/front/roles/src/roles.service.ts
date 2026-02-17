import {
  type Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { FACILITY_COLLECTION, ROLE_COLLECTION } from '@models/facility';
import type { Role } from '@models/permissions';

export async function getAllRoles(
  db: Firestore,
  facilityId: string
): Promise<Role[]> {
  const rolesRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    ROLE_COLLECTION
  );
  const snapshot = await getDocs(rolesRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Role);
}

export async function getRoleById(
  db: Firestore,
  facilityId: string,
  roleId: string
): Promise<Role | undefined> {
  const roleRef = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    ROLE_COLLECTION,
    roleId
  );
  const snapshot = await getDoc(roleRef);
  if (!snapshot.exists()) return undefined;
  return { id: snapshot.id, ...snapshot.data() } as Role;
}
