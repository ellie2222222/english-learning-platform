import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { ICourse } from "../interfaces/models/ICourse";
import { CourseLevelEnum } from "../enums/CourseLevelEnum";
import { CourseTypeEnum } from "../enums/CourseTypeEnum";

const CourseModelSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String, require: false },
    level: {
      type: String,
      required: true,
      enum: Object.values(CourseLevelEnum),
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(CourseTypeEnum),
    },
    totalLessons: {
      type: Number,
      required: false,
      min: 1,
    },
    coverImage: {
      type: String,
      required: true,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const CourseModel: Model<ICourse> = mongoose.model<ICourse>(
  "Course",
  CourseModelSchema
);

export default CourseModel;
