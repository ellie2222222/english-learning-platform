import { IReceipt } from "../models/IReceipt";
import { IQuery } from "../others/IQuery";

export interface IReceiptService {
  createReceipt(
    amount: number,
    userId: string,
    membershipId: string,
    paymentMethod: string,
    paymentGateway: string
  ): Promise<IReceipt | null>;

  getReceipt(id: string, requesterId: string): Promise<IReceipt | null>;

  getReceipts(
    query: IQuery,
    userId: string,
    requesterId: string
  ): Promise<IReceipt[] | null>;
}
