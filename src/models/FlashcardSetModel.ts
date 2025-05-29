import mongoose, { Model, Schema } from "mongoose";
import { IFlashcardSet } from "../interfaces/models/IFlashcardSet";
import baseModelSchema from "./BaseModel";

const FlashcardSetModelSchema = new Schema<IFlashcardSet>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ...baseModelSchema,
  },
  { timestamps: true }
);

const FlashcardSetModel: Model<IFlashcardSet> = mongoose.model<IFlashcardSet>(
  "Flashcard",
  FlashcardSetModelSchema
);

export default FlashcardSetModel;
