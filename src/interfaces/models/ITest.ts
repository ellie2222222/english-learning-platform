import mongoose, { Document } from "mongoose";

export interface ITest extends Document {
  lessonIds: mongoose.Schema.Types.ObjectId[] | string[];
  name: string;
  description: string;
  totalQuestions: number;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
