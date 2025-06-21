import mongoose from "mongoose";
import { IGrammar } from "../models/IGrammar";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IGrammarRepository {
  createGrammar(grammar: object, session?: any): Promise<IGrammar>;

  updateGrammar(
    grammarId: string,
    updateData: object,
    session?: any
  ): Promise<IGrammar | null>;

  deleteGrammar(
    grammarId: string,
    session?: mongoose.ClientSession
  ): Promise<IGrammar | null>;

  getGrammarById(grammarId: string): Promise<IGrammar | null>;

  getGrammars(query: IQuery): Promise<IPagination>;

  getGrammarsByLessonId(lessonId: string, query: IQuery): Promise<IPagination>;

  deleteGrammarByLessonId(
    lessonId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean>;

  deleteGrammarByLessonIds(
    lessonIds: mongoose.Types.ObjectId[],
    session?: mongoose.ClientSession
  ): Promise<boolean>;
}
