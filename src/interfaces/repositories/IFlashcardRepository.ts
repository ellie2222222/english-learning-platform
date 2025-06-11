import mongoose from "mongoose";
import { IFlashcard } from "../models/IFlashcard";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IFlashcardRepository {
  createFlashcard(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IFlashcard | null>;

  updateFlashcard(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IFlashcard | null>;

  deleteFlashcard(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IFlashcard | null>;

  getFlashcard(id: string): Promise<IFlashcard | null>;

  getFlashcards(flashcardSetId: string, query: IQuery): Promise<IPagination>;

  getFlashcardOrder(flashcardSetId: string): Promise<number>;

  deleteBatchFlashcards(
    flashcardSetId: string,
    session?: mongoose.ClientSession
  ): Promise<number>;
}
