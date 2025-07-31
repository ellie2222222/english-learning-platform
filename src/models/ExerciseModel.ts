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
    questionIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Question" }],
      required: true,
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
