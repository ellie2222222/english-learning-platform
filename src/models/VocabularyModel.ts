import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IVocabulary } from "../interfaces/models/IVocabulary";

const VocabularyModelSchema = new Schema<IVocabulary>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    englishContent: {
      type: String,
      required: true,
    },
    vietnameseContent: {
      type: String,
      required: true,
    },
    imageUrl: {
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

const VocabularyModel: Model<IVocabulary> = mongoose.model<IVocabulary>(
  "Vocabulary",
  VocabularyModelSchema
);

export default VocabularyModel;
