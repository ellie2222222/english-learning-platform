import mongoose from "mongoose";
import { IFlashcardSet } from "../models/IFlashcardSet";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IFlashcardSetRepository {
  getFlashcardSet(id: string): Promise<IFlashcardSet | null>;

  getFlashcardSets(query: IQuery, userId?: string): Promise<IPagination>;

  createFlashcardSet(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IFlashcardSet | null>;

  updateFlashcardSet(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IFlashcardSet | null>;

  deleteFlashcardSet(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IFlashcardSet | null>;

  getFlashcardSetByName(
    name: string,
    id?: string
  ): Promise<IFlashcardSet | null>;

  getFlashcardSetsByUserId(userId: string): Promise<IFlashcardSet[]>;
}
