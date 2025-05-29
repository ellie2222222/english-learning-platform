import mongoose, { Document } from "mongoose";

export interface ITest extends Document {
  lessonIds: mongoose.Schema.Types.ObjectId[];
  name: string;
  description: string;
  totalQuestions: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
