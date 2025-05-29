import mongoose, { Document } from "mongoose";

export interface IVocabulary extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  englishContent: string;
  vietnameseContent: string;
  imageUrl?: string;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
