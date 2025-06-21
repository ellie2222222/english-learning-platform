import mongoose, { Document } from "mongoose";
import { ILesson } from "./ILesson";

export interface IGrammar extends Document {
  lessonId: mongoose.Schema.Types.ObjectId | string | ILesson;
  title: string;
  structure: string;
  example?: string;
  explanation?: string;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
