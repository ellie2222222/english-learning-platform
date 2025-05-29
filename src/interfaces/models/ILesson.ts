import mongoose, { Document } from "mongoose";

export interface ILesson extends Document {
  courseId: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  length: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
