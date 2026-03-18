import { type Firestore, collectionGroup, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { type FacilityModel, EMPLOYEE_COLLECTION } from '@models/facility';

export async function getEmployeeFacilities(db: Firestore, userId: string): Promise<FacilityModel[]> {
  const employeesQuery = query(collectionGroup(db, EMPLOYEE_COLLECTION), where('uid', '==', userId));

  const snapshot = await getDocs(employeesQuery);

  const facilityPaths = snapshot.docs.map((d) => d.ref.parent.parent?.path).filter((path): path is string => !!path);

  const facilities = await Promise.all(
    facilityPaths.map(async (path) => {
      const facilityDoc = await getDoc(doc(db, path));
      return { id: facilityDoc.id, ...facilityDoc.data() } as FacilityModel;
    }),
  );

  return facilities;
}
