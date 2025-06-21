import mongoose, { Document } from "mongoose";
import { ICourse } from "./ICourse";

export interface ILesson extends Document {
  courseId: mongoose.Schema.Types.ObjectId | string | ICourse;
  name: string;
  description: string;
  length: number;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
