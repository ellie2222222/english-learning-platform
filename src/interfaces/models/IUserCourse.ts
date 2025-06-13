import mongoose, { Document } from "mongoose";
import { UserCourseStatusType } from "../../enums/UserCourseStatus";

export interface IUserCourse extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  lessonFinished: number;
  averageScore: number | null;
  status: UserCourseStatusType;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
