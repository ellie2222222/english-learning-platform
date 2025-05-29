import mongoose, { Document } from "mongoose";

export interface IGrammar extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  title: string;
  structure: string;
  example: string;
  explanation?: string;
  order: String;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
