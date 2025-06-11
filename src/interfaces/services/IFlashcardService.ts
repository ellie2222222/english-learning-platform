import { IFlashcard } from "../models/IFlashcard";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IFlashcardService {
  createFlashcard: (
    userId: string,
    englishContent: string,
    vietnameseContent: string,
    flashcardSetId: string
  ) => Promise<IFlashcard | null>;

  updateFlashcard: (
    id: string,
    userId: string,
    englishContent?: string,
    vietnameseContent?: string
  ) => Promise<IFlashcard | null>;

  deleteFlashcard: (id: string, userId: string) => Promise<IFlashcard | null>;

  getFlashcard: (id: string) => Promise<IFlashcard | null>;

  getFlashcards: (
    flashcardSetId: string,
    query: IQuery
  ) => Promise<IPagination>;
}
