import mongoose, { Document } from "mongoose";
import { ILesson } from "./ILesson";

export interface IVocabulary extends Document {
  lessonId: mongoose.Schema.Types.ObjectId | string | ILesson;
  englishContent: string;
  vietnameseContent: string;
  imageUrl?: string;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
