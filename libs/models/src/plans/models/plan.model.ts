import { PlanService } from './plan-service.model';
import { PlanDuration } from '../enums/plan-duration.enum';

export interface Plan {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: string;
  duration: {
    type: PlanDuration;
    days: number | null; // Required if type is 'custom'
  };
  services: PlanService[];
  active: boolean;
}
