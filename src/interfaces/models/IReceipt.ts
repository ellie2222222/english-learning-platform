import mongoose, { Document } from "mongoose";

export interface IReceipt extends Document {
  amount: string;
  userId: mongoose.Schema.Types.ObjectId;
  membershipId: string;
  paymentMethod: string;
  paymentGateway: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
