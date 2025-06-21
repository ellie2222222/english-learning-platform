import mongoose, { Document } from "mongoose";
import { ILesson } from "./ILesson";

export interface IExercise extends Document {
  lessonId: mongoose.Schema.Types.ObjectId | string | ILesson;
  type: string;
  question: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
  focus: string;
  image?: string;
  order: Number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
