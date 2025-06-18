import mongoose, { Document } from "mongoose";

export interface IGrammar extends Document {
  lessonId: mongoose.Schema.Types.ObjectId | string;
  title: string;
  structure: string;
  example?: string;
  explanation?: string;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
