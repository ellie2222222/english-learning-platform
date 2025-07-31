import mongoose, { Document } from "mongoose";
import { ILesson } from "./ILesson";

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  lessonId: mongoose.Schema.Types.ObjectId | string | ILesson;
  question: string;
  type: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
  focus: string;
  image?: string;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 