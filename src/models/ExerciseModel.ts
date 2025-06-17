import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IExercise } from "../interfaces/models/IExercise";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import { ExerciseFocusEnum } from "../enums/ExerciseFocusEnum";

const ExerciseModelSchema = new Schema<IExercise>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(ExerciseTypeEnum),
    },
    question: {
      type: String,
      required: true,
    },

    options: {
      type: [{ type: String }],
      required: false,
    },
    answer: {
      type: [{ type: String }],
      required: true,
    },
    explanation: {
      type: String,
      required: false,
    },
    focus: {
      type: String,
      required: true,
      enum: Object.values(ExerciseFocusEnum),
    },
    image: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      required: true,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const ExerciseModel: Model<IExercise> = mongoose.model<IExercise>(
  "Exercise",
  ExerciseModelSchema
);

export default ExerciseModel;
