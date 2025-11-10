import { ClassLimitType } from '../enums/class-limit-type.enum';

export interface PlanService {
  serviceId: string;
  classLimitType: ClassLimitType;
  classLimit: number | null; // Required if type is 'fixed'
}
