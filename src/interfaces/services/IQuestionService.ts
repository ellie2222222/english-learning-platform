import { IQuestion } from "../models/IQuestion";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IQuestionService {
  createQuestion: (
    lessonId: string,
    type: string,
    question: string,
    answer: string | string[],
    focus: string,
    options?: string[],
    explanation?: string,
    image?: string
  ) => Promise<IQuestion | null>;
  
  updateQuestion: (
    id: string,
    question: string,
    answer: string | string[],
    focus: string,
    options?: string[],
    explanation?: string,
    image?: string
  ) => Promise<IQuestion | null>;
  
  deleteQuestion: (id: string) => Promise<IQuestion | null>;
  
  getQuestions: (
    query: IQuery,
    lessonId: string
  ) => Promise<IPagination>;
  
  getQuestion: (id: string) => Promise<IQuestion | null>;
} 