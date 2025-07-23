import mongoose, { Model, Schema } from "mongoose";
import { IUserCourse } from "../interfaces/models/IUserCourse";
import baseModelSchema from "./BaseModel";
import { UserCourseStatus } from "../enums/UserCourseStatus";

const UserCourseModelSchema = new Schema<IUserCourse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonFinished: {
      type: Number,
      required: false,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: Object.values(UserCourseStatus),
      default: UserCourseStatus.ONGOING,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

// Add unique compound index to prevent duplicate enrollments
UserCourseModelSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const UserCourseModel: Model<IUserCourse> = mongoose.model<IUserCourse>(
  "UserCourse",
  UserCourseModelSchema
);

export default UserCourseModel;
