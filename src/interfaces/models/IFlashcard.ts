import { Document } from "mongoose";

export interface IFlashcard extends Document {
  englishContent: string;
  vietnameseContent: string;
  flashcardSetId: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
