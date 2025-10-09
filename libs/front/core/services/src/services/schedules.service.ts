import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, catchError, from, map, throwError } from 'rxjs';

import { ServiceSchedule, SERVICES_COLLECTION, SCHEDULES_COLLECTION } from '@models/services';
import { FACILITY_COLLECTION } from '@models/facility';

export class SchedulesServiceError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public serviceId?: string,
    public scheduleId?: string,
  ) {
    super(`${message} - ${originalError.message}`);
    this.name = 'SchedulesServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  /* ************************************************************************** */
  /* * PRIVATE INJECTIONS                                                     * */
  /* ************************************************************************** */

  private firestore = inject(Firestore);

  /* ************************************************************************** */
  /* * PRIVATE METHODS                                                        * */
  /* ************************************************************************** */

  private getSchedulesCollectionRef(facilityId: string, serviceId: string): CollectionReference<ServiceSchedule> {
    const path = `${FACILITY_COLLECTION}/${facilityId}/${SERVICES_COLLECTION}/${serviceId}/${SCHEDULES_COLLECTION}`;
    return collection(this.firestore, path) as CollectionReference<ServiceSchedule>;
  }

  /* ************************************************************************** */
  /* * PUBLIC METHODS                                                         * */
  /* ************************************************************************** */

  async createSchedule(facilityId: string, serviceId: string, schedule: Omit<ServiceSchedule, 'id'>): Promise<string> {
    const colRef = this.getSchedulesCollectionRef(facilityId, serviceId);
    const newRef = doc(colRef);
    const docData: ServiceSchedule = {
      ...schedule,
      id: newRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    try {
      await setDoc(newRef, docData);
      return newRef.id;
    } catch (error) {
      throw new SchedulesServiceError('Failed to create schedule', error as Error, serviceId);
    }
  }

  async updateSchedule(facilityId: string, serviceId: string, schedule: ServiceSchedule): Promise<void> {
    const ref = doc(this.getSchedulesCollectionRef(facilityId, serviceId), schedule.id);
    try {
      return await setDoc(ref, schedule, { merge: true });
    } catch (error) {
      throw new SchedulesServiceError('Failed to update schedule', error as Error, serviceId, schedule.id);
    }
  }

  async deleteSchedule(facilityId: string, serviceId: string, scheduleId: string): Promise<void> {
    const ref = doc(this.getSchedulesCollectionRef(facilityId, serviceId), scheduleId);
    try {
      return await deleteDoc(ref);
    } catch (error) {
      throw new SchedulesServiceError('Failed to delete schedule', error as Error, serviceId, scheduleId);
    }
  }

  getAllSchedules(facilityId: string, serviceId: string): Observable<ServiceSchedule[]> {
    const q = query(this.getSchedulesCollectionRef(facilityId, serviceId));
    return from(getDocs(q)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ServiceSchedule)),
      catchError((error) =>
        throwError(() => new SchedulesServiceError('Failed to fetch all schedules', error, serviceId)),
      ),
    );
  }

  getScheduleById(facilityId: string, serviceId: string, scheduleId: string): Observable<ServiceSchedule | undefined> {
    const ref = doc(this.getSchedulesCollectionRef(facilityId, serviceId), scheduleId);
    return from(getDoc(ref)).pipe(
      map((snapshot) => (snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as ServiceSchedule) : undefined)),
      catchError((error) =>
        throwError(() => new SchedulesServiceError('Failed to fetch schedule by id', error, serviceId, scheduleId)),
      ),
    );
  }
}
