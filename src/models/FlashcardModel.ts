import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IFlashcard } from "../interfaces/models/IFlashcard";

const FlashcardModelSchema = new Schema<IFlashcard>(
  {
    englishContent: { type: String, required: true },
    vietnameseContent: {
      type: String,
      required: true,
    },
    flashcardSetId: {
      type: Schema.Types.ObjectId,
      ref: "FlashcardSet",
      required: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const FlashcardModel: Model<IFlashcard> = mongoose.model<IFlashcard>(
  "Flashcard",
  FlashcardModelSchema
);

export default FlashcardModel;
