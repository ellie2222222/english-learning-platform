import { Document, Schema } from "mongoose";

export interface IFlashcard extends Document {
  englishContent: string;
  vietnameseContent: string;
  flashcardSetId: Schema.Types.ObjectId;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
