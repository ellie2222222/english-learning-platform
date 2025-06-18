import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { ITest } from "../interfaces/models/ITest";

const TestModelSchema = new Schema<ITest>(
  {
    lessonIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],

      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    name: { type: String, required: true },
    description: { type: String, require: false },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    order: {
      type: Number,
      required: true,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const TestModel: Model<ITest> = mongoose.model<ITest>("Test", TestModelSchema);

export default TestModel;
