import mongoose from "mongoose";
import { IReceipt } from "../models/IReceipt";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IReceiptRepository {
  createReceipt(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null>;

  updateReceipt(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null>;

  deleteReceipt(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null>;

  getReceipt(id: string): Promise<IReceipt | null>;

  getReceipts(query: IQuery, userId: string): Promise<IPagination>;
}
