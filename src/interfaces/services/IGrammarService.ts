import { IGrammar } from "../models/IGrammar";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";


export interface IGrammarService {
  createGrammar(
    lessonId: string,
    title: string,
    structure: string,
    example: string | undefined,
    explanation: string | undefined,
    order: number
  ): Promise<IGrammar>;

  updateGrammar(
    grammarId: string,
    lessonId: string | undefined,
    title: string | undefined,
    structure: string | undefined,
    example: string | undefined,
    explanation: string | undefined,
    order: number | undefined
  ): Promise<IGrammar | null>;

  deleteGrammar(grammarId: string): Promise<IGrammar | null>;

  getGrammarById(grammarId: string): Promise<IGrammar | null>;

  getGrammars(query: IQuery): Promise<IPagination>;

  getGrammarsByLessonId(lessonId: string, query: IQuery): Promise<IPagination>;
}