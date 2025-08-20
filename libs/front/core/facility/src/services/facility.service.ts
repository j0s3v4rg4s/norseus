import { Injectable, inject } from '@angular/core';
import { Firestore, collectionGroup, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { FacilityModel, FACILITY_COLLECTION, EMPLOYEE_COLLECTION, CLIENT_COLLECTION } from '@models/facility';

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  private firestore = inject(Firestore);

  async getEmployeeFacilities(uid: string) {
    const facilities: FacilityModel[] = [];
    const employeeDocs = await getDocs(
      query(collectionGroup(this.firestore, EMPLOYEE_COLLECTION), where('__name__', '==', uid)),
    );
    for (const document of employeeDocs.docs) {
      const parent = document.ref.parent;
      const facilityDoc = await getDoc(doc(this.firestore, FACILITY_COLLECTION, parent.id));
      if (facilityDoc.exists()) {
        facilities.push(facilityDoc.data() as FacilityModel);
      }
    }
    return facilities;
  }

  async getClientFacilities(uid: string) {
    const facilities: FacilityModel[] = [];
    const clientDocs = await getDocs(
      query(collectionGroup(this.firestore, CLIENT_COLLECTION), where('__name__', '==', uid)),
    );
    for (const document of clientDocs.docs) {
      const parent = document.ref.parent;
      const facilityDoc = await getDoc(doc(this.firestore, FACILITY_COLLECTION, parent.id));
      if (facilityDoc.exists()) {
        facilities.push(facilityDoc.data() as FacilityModel);
      }
    }
    return facilities;
  }
}
