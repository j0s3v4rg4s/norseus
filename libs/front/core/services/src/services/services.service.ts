import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  Firestore,
  query,
  setDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, catchError, from, throwError } from 'rxjs';

import { Service, SERVICES_COLLECTION } from '@models/services';
import { FACILITY_COLLECTION } from '@models/facility';

export class ServicesServiceError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public serviceId?: string,
  ) {
    super(`${message} - ${originalError.message}`);
    this.name = 'ServicesServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  /* ************************************************************************** */
  /* * PRIVATE INJECTIONS                                                     * */
  /* ************************************************************************** */

  private firestore = inject(Firestore);

  /* ************************************************************************** */
  /* * PRIVATE METHODS                                                        * */
  /* ************************************************************************** */

  private getServicesCollectionRef(facilityId: string): CollectionReference<Service> {
    const path = `${FACILITY_COLLECTION}/${facilityId}/${SERVICES_COLLECTION}`;
    return collection(this.firestore, path) as CollectionReference<Service>;
  }

  /* ************************************************************************** */
  /* * SERVICE OPERATIONS                                                     * */
  /* ************************************************************************** */

  createService(facilityId: string, service: Omit<Service, 'id'>): Observable<void> {
    const colRef = this.getServicesCollectionRef(facilityId);
    const newRef = doc(colRef);
    return from(setDoc(newRef, { ...service, id: newRef.id, createdAt: Timestamp.now(), updatedAt: Timestamp.now() })).pipe(
      catchError((error) => throwError(() => new ServicesServiceError('Failed to create service', error))),
    );
  }

  updateService(facilityId: string, service: Service): Observable<void> {
    const ref = doc(this.getServicesCollectionRef(facilityId), service.id);
    return from(setDoc(ref, { ...service, updatedAt: Timestamp.now() })).pipe(
      catchError((error) => throwError(() => new ServicesServiceError('Failed to update service', error, service.id))),
    );
  }

  /**
   * Deletes a service from the specified facility.
   *
   * Service schedules are automatically deleted by Cloud Function 'deleteServiceSchedules'
   * when the service document is deleted. See apps/functions/src/delete-service-schedules.function.ts
   *
   * @param facilityId - The ID of the facility containing the service
   * @param serviceId - The ID of the service to delete
   * @returns Observable that completes when the service is deleted
   * @throws ServicesServiceError when deletion fails
   */
  deleteService(facilityId: string, serviceId: string): Observable<void> {
    const ref = doc(this.getServicesCollectionRef(facilityId), serviceId);
    return from(deleteDoc(ref)).pipe(
      catchError((error) => throwError(() => new ServicesServiceError('Failed to delete service', error, serviceId))),
    );
  }

  getAllServices(facilityId: string): Observable<Service[]> {
    const q = query(this.getServicesCollectionRef(facilityId));
    return (collectionData(q, { idField: 'id' }) as Observable<Service[]>).pipe(
      catchError((error) => throwError(() => new ServicesServiceError('Failed to fetch all services', error))),
    );
  }

  getServiceById(facilityId: string, serviceId: string): Observable<Service | undefined> {
    const ref = doc(this.getServicesCollectionRef(facilityId), serviceId);
    return (docData(ref, { idField: 'id' }) as Observable<Service>).pipe(
      catchError((error) =>
        throwError(() => new ServicesServiceError('Failed to fetch service by id', error, serviceId)),
      ),
    );
  }

}
