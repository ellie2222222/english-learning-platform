import mongoose, { Document } from "mongoose";

export interface IFlashcardSet extends Document {
  name: string;
  description: string;
  userId: mongoose.Schema.Types.ObjectId;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
