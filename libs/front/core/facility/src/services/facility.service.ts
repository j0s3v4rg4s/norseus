import { Injectable, inject } from '@angular/core';
import { Firestore, collectionGroup, query, where, getDocs, doc, docData } from '@angular/fire/firestore';
import { FacilityModel, FACILITY_COLLECTION, EMPLOYEE_COLLECTION, CLIENT_COLLECTION } from '@models/facility';
import { combineLatest, filter, from, map, mergeMap, Observable, catchError, throwError } from 'rxjs';

// Custom error for FacilityService
export class FacilityServiceError extends Error {
  constructor(
    message: string,
    public originalError: unknown,
    public userId: string,
    public method: 'getEmployeeFacilities' | 'getClientFacilities',
  ) {
    super(message);
    this.name = 'FacilityServiceError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  private firestore = inject(Firestore);

  getEmployeeFacilities(uid: string) {
    const queryDb = query(collectionGroup(this.firestore, EMPLOYEE_COLLECTION), where('uid', '==', uid));

    return from(getDocs(queryDb)).pipe(
      map((docu) => docu.docs.map((doc) => doc.ref.parent.parent?.path).filter((path) => !!path) as string[]),
      filter((paths) => paths.length > 0),
      mergeMap((paths) =>
        combineLatest(
          paths.map((path) => docData(doc(this.firestore, path), { idField: 'id' }) as Observable<FacilityModel>),
        ),
      ),
      catchError((error) =>
        throwError(
          () => new FacilityServiceError('Failed to fetch employee facilities', error, uid, 'getEmployeeFacilities'),
        ),
      ),
    );
  }

  getClientFacilities(uid: string) {
    const queryDb = query(collectionGroup(this.firestore, CLIENT_COLLECTION), where('uid', '==', uid));
    return from(getDocs(queryDb)).pipe(
      map((docu) => docu.docs.map((doc) => doc.ref.parent?.id).filter((id): id is string => !!id)),
      filter((ids) => ids.length > 0),
      mergeMap((ids) =>
        combineLatest(
          ids.map(
            (id) =>
              docData(doc(this.firestore, FACILITY_COLLECTION, id), { idField: 'id' }) as Observable<FacilityModel>,
          ),
        ),
      ),
      catchError((error) =>
        throwError(
          () => new FacilityServiceError('Failed to fetch client facilities', error, uid, 'getClientFacilities'),
        ),
      ),
    );
  }
}
