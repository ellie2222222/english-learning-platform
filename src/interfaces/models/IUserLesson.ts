import mongoose, { Document } from "mongoose";
import { UserLessonStatusType } from "../../enums/UserLessonStatus";

export interface IUserLesson extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  currentOrder: number;
  status: UserLessonStatusType;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
