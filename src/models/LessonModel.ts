import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { ILesson } from "../interfaces/models/ILesson";

const LessonModelSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, require: false },
    length: {
      type: Number,
      required: false,
      min: 0,
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
