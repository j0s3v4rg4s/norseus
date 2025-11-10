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
