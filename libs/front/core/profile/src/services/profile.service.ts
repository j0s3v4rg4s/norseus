import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, DocumentReference } from '@angular/fire/firestore';
import { ProfileModel, PROFILE_COLLECTION } from '@models/user';
import { catchError, throwError } from 'rxjs';

// Custom error for ProfileService
export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public originalError: unknown,
    public userId: string
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly firestore = inject(Firestore);

  getProfile(userId: string) {
    const profileDocRef = doc(this.firestore, `${PROFILE_COLLECTION}/${userId}`) as DocumentReference<ProfileModel>;
    return docData(profileDocRef, {idField: 'id'}).pipe(
      catchError((error) => 
        throwError(() => new ProfileServiceError('Failed to fetch profile', error, userId))
      )
    );
  }
}
