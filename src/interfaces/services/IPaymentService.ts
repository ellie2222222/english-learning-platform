import { IReceipt } from "../models/IReceipt";
import { IUser } from "../models/IUser";
import { IPaymentData } from "../others/IPaymentData";
import { IVNPayParams } from "../others/IVNPayParams";

export interface IPaymentService {
  createPaypalPayment: (
    membershipId: string,
    userId: string,
    platform: string
  ) => Promise<string>;

  createVNPayPayment: (
    membershipId: string,
    userId: string,
    platform: string,
    ipAddr?: string,
    bankCode?: string
  ) => Promise<string>;

  handleSuccessPayment: (
    userId: string,
    membershipId: string,
    transactionId: string,
    totalAmount: number,
    paymentMethod: string,
    paymentGateway: string
  ) => Promise<IReceipt | null>;

  paypalSuccess: (token: string) => Promise<IPaymentData | null>;
  vnpaySuccess: (vnp_Params: IVNPayParams) => Promise<IPaymentData | null>;
}
