import mongoose, { Document } from "mongoose";

export interface IMembership extends Document {
  name: string;
  description?: string;
  duration: number;
  price: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
