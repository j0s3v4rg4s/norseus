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
} from '@angular/fire/firestore';
import { FACILITY_COLLECTION } from '@models/facility';
import { Plan, PLANS_COLLECTION } from '@models/plans';

export class PlansServiceError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public planId?: string,
  ) {
    super(`${message} - ${originalError.message}`);
    this.name = 'PlansServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class PlansService {
  private firestore = inject(Firestore);

  private getPlansCollectionRef(facilityId: string): CollectionReference<Plan> {
    const path = `${FACILITY_COLLECTION}/${facilityId}/${PLANS_COLLECTION}`;
    return collection(this.firestore, path) as CollectionReference<Plan>;
  }

  async createPlan(facilityId: string, plan: Omit<Plan, 'id'>): Promise<string> {
    const colRef = this.getPlansCollectionRef(facilityId);
    const newRef = doc(colRef);

    try {
      await setDoc(newRef, { ...plan, id: newRef.id });
      return newRef.id;
    } catch (error) {
      throw new PlansServiceError('Failed to create plan', error as Error);
    }
  }

  async updatePlan(facilityId: string, plan: Plan): Promise<void> {
    const ref = doc(this.getPlansCollectionRef(facilityId), plan.id);
    try {
      await setDoc(ref, { ...plan });
    } catch (error) {
      throw new PlansServiceError('Failed to update plan', error as Error, plan.id);
    }
  }

  async deletePlan(facilityId: string, planId: string): Promise<void> {
    const ref = doc(this.getPlansCollectionRef(facilityId), planId);
    try {
      await deleteDoc(ref);
    } catch (error) {
      throw new PlansServiceError('Failed to delete plan', error as Error, planId);
    }
  }

  async getAllPlans(facilityId: string): Promise<Plan[]> {
    const q = query(this.getPlansCollectionRef(facilityId));
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Plan);
    } catch (error) {
      throw new PlansServiceError('Failed to fetch all plans', error as Error);
    }
  }

  async getPlanById(facilityId: string, planId: string): Promise<Plan | undefined> {
    const ref = doc(this.getPlansCollectionRef(facilityId), planId);
    try {
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Plan) : undefined;
    } catch (error) {
      throw new PlansServiceError('Failed to fetch plan by id', error as Error, planId);
    }
  }
}
