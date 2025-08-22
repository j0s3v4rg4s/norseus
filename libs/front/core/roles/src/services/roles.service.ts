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
} from '@angular/fire/firestore';
import { Observable, catchError, from, map, throwError } from 'rxjs';

import { Role } from '../models/role.model';

export class RolesServiceError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public roleId?: string,
  ) {
    super(`${message} - ${originalError.message}`);
    this.name = 'RolesServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  /* ************************************************************************** */
  /* * PRIVATE INJECTIONS                                                     * */
  /* ************************************************************************** */

  private firestore = inject(Firestore);

  /* ************************************************************************** */
  /* * PRIVATE METHODS                                                        * */
  /* ************************************************************************** */

  private getRolesCollectionRef(facilityId: string): CollectionReference<Role> {
    return collection(this.firestore, `facilities/${facilityId}/roles`) as CollectionReference<Role>;
  }

  /* ************************************************************************** */
  /* * PUBLIC METHODS                                                         * */
  /* ************************************************************************** */

  createRole(facilityId: string, role: Omit<Role, 'id'>): Observable<string> {
    const colRef = this.getRolesCollectionRef(facilityId);
    const newRef = doc(colRef);
    return from(setDoc(newRef, { ...role, id: newRef.id })).pipe(
      map(() => newRef.id),
      catchError((error) => throwError(() => new RolesServiceError('Failed to create role', error))),
    );
  }

  deleteRole(facilityId: string, roleId: string): Observable<void> {
    const ref = doc(this.getRolesCollectionRef(facilityId), roleId);
    return from(deleteDoc(ref)).pipe(
      catchError((error) => throwError(() => new RolesServiceError('Failed to delete role', error, roleId))),
    );
  }

  getAllRoles(facilityId: string): Observable<Role[]> {
    const q = query(this.getRolesCollectionRef(facilityId));
    return collectionData(q).pipe(
      catchError((error) => throwError(() => new RolesServiceError('Failed to fetch all roles', error))),
    );
  }

  getRoleById(facilityId: string, roleId: string): Observable<Role | undefined> {
    const ref = doc(this.getRolesCollectionRef(facilityId), roleId);
    return docData(ref).pipe(
      catchError((error) => throwError(() => new RolesServiceError('Failed to fetch role by id', error, roleId))),
    );
  }

  updateRole(facilityId: string, role: Role): Observable<void> {
    const ref = doc(this.getRolesCollectionRef(facilityId), role.id);
    return from(setDoc(ref, role, { merge: true })).pipe(
      catchError((error) => throwError(() => new RolesServiceError('Failed to update role', error, role.id))),
    );
  }
}
