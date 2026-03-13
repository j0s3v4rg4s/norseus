export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export const SubscriptionStatusNames: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Activo',
  [SubscriptionStatus.EXPIRED]: 'Expirado',
  [SubscriptionStatus.CANCELLED]: 'Cancelado',
};
