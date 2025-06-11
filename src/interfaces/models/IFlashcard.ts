import { Document, Schema } from "mongoose";

export interface IFlashcard extends Document {
  englishContent: string;
  vietnameseContent: string;
  flashcardSetId: Schema.Types.ObjectId;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
