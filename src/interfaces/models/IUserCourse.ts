import mongoose, { Document } from "mongoose";

export interface IUserCourse extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  lessonFinished: number;
  averageScore: number | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
