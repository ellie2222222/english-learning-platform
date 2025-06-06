import mongoose, { Document } from "mongoose";

export interface ILesson extends Document {
  courseId: mongoose.Schema.Types.ObjectId | string;
  name: string;
  description: string;
  length: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
