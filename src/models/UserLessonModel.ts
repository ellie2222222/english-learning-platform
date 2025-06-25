import mongoose, { Model, Schema } from "mongoose";
import { IUserLesson } from "../interfaces/models/IUserLesson";
import baseModelSchema from "./BaseModel";
import { UserLessonStatus } from "../enums/UserLessonStatus";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

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
    currentOrder: [
      {
        for: {
          type: String,
          enum: Object.values(LessonTrackingType),
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: Object.values(UserLessonStatus),
      default: UserLessonStatus.ONGOING,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const UserLessonModel: Model<IUserLesson> = mongoose.model<IUserLesson>(
  "UserLesson",
  UserLessonModelSchema
);

export default UserLessonModel;
