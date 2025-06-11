import { IFlashcardSet } from "../models/IFlashcardSet";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IFlashcardSetService {
  createFlashcardSet: (
    name: string,
    userId: string,
    description?: string
  ) => Promise<IFlashcardSet | null>;

  updateFlashcardSet: (
    id: string,
    userId: string,
    name?: string,
    description?: string
  ) => Promise<IFlashcardSet | null>;

  deleteFlashcardSet: (
    id: string,
    userId: string
  ) => Promise<IFlashcardSet | null>;

  getFlashcardSet: (id: string) => Promise<IFlashcardSet | null>;

  getFlashcardSets: (query: IQuery, userId?: string) => Promise<IPagination>;
}
