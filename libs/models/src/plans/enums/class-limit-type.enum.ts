export enum ClassLimitType {
  FIXED = 'fixed',
  UNLIMITED = 'unlimited',
}

export const ClassLimitTypeNames: { [key in ClassLimitType]: string } = {
  [ClassLimitType.FIXED]: 'Cantidad definida',
  [ClassLimitType.UNLIMITED]: 'Ilimitado',
};

export const ClassLimitTypeValues = Object.values(ClassLimitType);
