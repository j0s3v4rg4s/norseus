export enum PlanDuration {
  MONTHLY = 'monthly',
  BIMONTHLY = 'bimonthly',
  QUARTERLY = 'quarterly',
  SEMIANNUALLY = 'semiannually',
  ANNUALLY = 'annually',
  CUSTOM = 'custom',
}

export const PlanDurationNames: { [key in PlanDuration]: string } = {
  [PlanDuration.MONTHLY]: 'Mensual',
  [PlanDuration.BIMONTHLY]: 'Bimestral',
  [PlanDuration.QUARTERLY]: 'Trimestral',
  [PlanDuration.SEMIANNUALLY]: 'Semestral',
  [PlanDuration.ANNUALLY]: 'Anual',
  [PlanDuration.CUSTOM]: 'Personalizado (días)',
};

/** Number of days for each plan duration type (excludes CUSTOM — use plan.duration.days) */
export const PlanDurationDays: Record<Exclude<PlanDuration, PlanDuration.CUSTOM>, number> = {
  [PlanDuration.MONTHLY]: 30,
  [PlanDuration.BIMONTHLY]: 60,
  [PlanDuration.QUARTERLY]: 90,
  [PlanDuration.SEMIANNUALLY]: 180,
  [PlanDuration.ANNUALLY]: 365,
};
