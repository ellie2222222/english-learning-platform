import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IQuestion } from "../interfaces/models/IQuestion";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import { ExerciseFocusEnum } from "../enums/ExerciseFocusEnum";

const QuestionModelSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        ExerciseTypeEnum.MULTIPLE_CHOICE,
        ExerciseTypeEnum.TRANSLATE,
        ExerciseTypeEnum.FILL_IN_THE_BLANK,
        ExerciseTypeEnum.IMAGE_TRANSLATE,
      ],
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
      enum: [ExerciseFocusEnum.VOCABULARY, ExerciseFocusEnum.GRAMMAR],
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

const QuestionModel: Model<IQuestion> = mongoose.model<IQuestion>(
  "Question",
  QuestionModelSchema
);

export default QuestionModel; 