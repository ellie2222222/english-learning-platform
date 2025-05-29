import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IGrammar } from "../interfaces/models/IGrammar";

const GrammarModelSchema = new Schema<IGrammar>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    structure: {
      type: String,
      required: true,
    },
    example: {
      type: String,
      required: false,
    },
    explanation: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      required: true,
    },

    ...baseModelSchema,
  },
  { timestamps: true }
);

const GrammarModel: Model<IGrammar> = mongoose.model<IGrammar>(
  "Grammar",
  GrammarModelSchema
);

export default GrammarModel;
