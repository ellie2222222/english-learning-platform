import mongoose, { Document } from "mongoose";

export interface IExercise extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  type: string;
  question: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
  focus: string;
  image?: string;
  order: String;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
