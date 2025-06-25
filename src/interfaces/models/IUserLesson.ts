import mongoose, { Document } from "mongoose";
import { UserLessonStatusType } from "../../enums/UserLessonStatus";
import { ILessonTracking } from "../others/ILessonTracking";

export interface IUserLesson extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  currentOrder: ILessonTracking[];
  status: UserLessonStatusType;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
