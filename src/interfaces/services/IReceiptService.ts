import { IReceipt } from "../models/IReceipt";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IReceiptService {
  createReceipt: (
    amount: number,
    userId: string,
    membershipId: string,
    transactionId: string,
    paymentMethod: string,
    paymentGateway: string
  ) => Promise<IReceipt | null>;

  getReceipt: (id: string, requesterId: string) => Promise<IReceipt | null>;

  getReceipts: (
    query: IQuery,
    userId: string,
    requesterId: string
  ) => Promise<IPagination>;

  getAllReceipts: (query: IQuery) => Promise<IPagination>;
}
