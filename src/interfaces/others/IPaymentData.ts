export interface IPaymentData {
  userId: string;
  membershipPackageId: string;
  platform: string;
  totalAmount: {
    value: string | number | undefined;
    currency: string | undefined;
  };
  transactionId: string;
  paymentMethod: string;
  paymentGateway: string;
  type: string;
  bankCode?: string;
}
