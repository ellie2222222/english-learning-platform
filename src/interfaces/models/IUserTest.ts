import mongoose, { Document } from "mongoose";

export interface IUserTest extends Document {
  testId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  attemptNo: number;
  score: number;
  status: string;
  description: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
