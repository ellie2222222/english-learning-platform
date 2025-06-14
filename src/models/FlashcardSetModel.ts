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
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const FlashcardSetModel: Model<IFlashcardSet> = mongoose.model<IFlashcardSet>(
  "FlashcardSet",
  FlashcardSetModelSchema
);

export default FlashcardSetModel;
