import { inject, Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, catchError, from, map, throwError } from 'rxjs';

import { ClassModel, CLASSES_COLLECTION } from '@models/classes';
import { FACILITY_COLLECTION } from '@models/facility';

export class ClassesServiceError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public classId?: string,
  ) {
    super(`${message} - ${originalError.message}`);
    this.name = 'ClassesServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class ClassesService {
  /* ************************************************************************** */
  /* * PRIVATE INJECTIONS                                                     * */
  /* ************************************************************************** */

  private firestore = inject(Firestore);

  /* ************************************************************************** */
  /* * PRIVATE METHODS                                                        * */
  /* ************************************************************************** */

  private getClassesCollectionRef(facilityId: string): CollectionReference<ClassModel> {
    const path = `${FACILITY_COLLECTION}/${facilityId}/${CLASSES_COLLECTION}`;
    return collection(this.firestore, path) as CollectionReference<ClassModel>;
  }

  /* ************************************************************************** */
  /* * SERVICE OPERATIONS                                                     * */
  /* ************************************************************************** */

  async createClass(facilityId: string, classData: Omit<ClassModel, 'id'>): Promise<string> {
    const colRef = this.getClassesCollectionRef(facilityId);
    const newRef = doc(colRef);

    try {
      await setDoc(newRef, { ...classData, id: newRef.id });
      return newRef.id;
    } catch (error) {
      throw new ClassesServiceError('Failed to create class', error as Error);
    }
  }

  async createMultipleClasses(facilityId: string, classes: Omit<ClassModel, 'id'>[]): Promise<string[]> {
    const colRef = this.getClassesCollectionRef(facilityId);
    const classIds: string[] = [];

    try {
      for (const classData of classes) {
        const newRef = doc(colRef);
        await setDoc(newRef, { ...classData, id: newRef.id });
        classIds.push(newRef.id);
      }
      return classIds;
    } catch (error) {
      throw new ClassesServiceError('Failed to create multiple classes', error as Error);
    }
  }

  getAllClasses(facilityId: string): Observable<ClassModel[]> {
    const q = query(this.getClassesCollectionRef(facilityId));
    return from(getDocs(q)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ClassModel)),
      catchError((error) => throwError(() => new ClassesServiceError('Failed to fetch all classes', error))),
    );
  }

  async getClassesByService(facilityId: string, serviceId: string): Promise<ClassModel[]> {
    const q = query(
      this.getClassesCollectionRef(facilityId),
      where('serviceId', '==', serviceId)
    );

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ClassModel);
    } catch (error) {
      throw new ClassesServiceError('Failed to fetch classes by service', error as Error);
    }
  }

  async getClassById(facilityId: string, classId: string): Promise<ClassModel | undefined> {
    const ref = doc(this.getClassesCollectionRef(facilityId), classId);

    try {
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as ClassModel) : undefined;
    } catch (error) {
      throw new ClassesServiceError('Failed to fetch class by id', error as Error, classId);
    }
  }

  async updateClass(facilityId: string, classModel: ClassModel): Promise<void> {
    const ref = doc(this.getClassesCollectionRef(facilityId), classModel.id);
    try {
      await setDoc(ref, classModel, { merge: true });
    } catch (error) {
      throw new ClassesServiceError('Failed to update class', error as Error, classModel.id);
    }
  }

  deleteClass(facilityId: string, classId: string): Observable<void> {
    const ref = doc(this.getClassesCollectionRef(facilityId), classId);
    return from(deleteDoc(ref)).pipe(
      catchError((error) => throwError(() => new ClassesServiceError('Failed to delete class', error, classId))),
    );
  }

  async getAvailableClasses(facilityId: string, serviceId?: string): Promise<ClassModel[]> {
    const now = new Date();
    let q = query(
      this.getClassesCollectionRef(facilityId),
      where('date', '>=', now)
    );

    if (serviceId) {
      q = query(q, where('serviceId', '==', serviceId));
    }

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }) as ClassModel)
        .filter(classModel => classModel.userBookings.length < classModel.capacity);
    } catch (error) {
      throw new ClassesServiceError('Failed to fetch available classes', error as Error);
    }
  }
}
