import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { ILesson } from "../interfaces/models/ILesson";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

const LessonModelSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, require: false },
    length: [
      {
        _id: false,
        for: {
          type: String,
          enum: Object.values(LessonTrackingType),
        },
        amount: {
          type: Number,
          default: 0,
        },
      },
    ],
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const LessonModel: Model<ILesson> = mongoose.model<ILesson>(
  "Lesson",
  LessonModelSchema
);

export default LessonModel;
