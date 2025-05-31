import mongoose, { Document } from "mongoose";

export interface IReceipt extends Document {
  amount: number;
  userId: mongoose.Schema.Types.ObjectId;
  membershipId: mongoose.Schema.Types.ObjectId;
  paymentMethod: string;
  paymentGateway: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
