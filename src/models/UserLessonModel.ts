import mongoose, { Model, Schema } from "mongoose";
import { IUserLesson } from "../interfaces/models/IUserLesson";
import baseModelSchema from "./BaseModel";
import { UserLessonStatus } from "../enums/UserLessonStatus";

const UserLessonModelSchema = new Schema<IUserLesson>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    currentOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(UserLessonStatus),
      default: UserLessonStatus.ON_GOING,
    },
    ...baseModelSchema,
  },
  { timestamps: true }
);

const UserLessonModel: Model<IUserLesson> = mongoose.model<IUserLesson>(
  "UserLesson",
  UserLessonModelSchema
);

export default UserLessonModel;
