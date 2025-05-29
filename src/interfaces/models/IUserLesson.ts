import mongoose, { Document } from "mongoose";

export interface IUserLesson extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  currentOrder: number;
  status: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
