import { IQuestion } from "../models/IQuestion";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import mongoose from "mongoose";

export interface IQuestionRepository {
  createQuestion(
    data: Partial<IQuestion>,
    session?: mongoose.ClientSession
  ): Promise<IQuestion | null>;
  
  updateQuestion(
    id: string,
    data: Partial<IQuestion>,
    session?: mongoose.ClientSession
  ): Promise<IQuestion | null>;
  
  deleteQuestion(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IQuestion | null>;
  
  getQuestion(id: string): Promise<IQuestion | null>;
  
  getQuestions(
    query: IQuery,
    lessonId?: string
  ): Promise<IPagination>;
  
  getQuestionsByLessonId(lessonId: string): Promise<IQuestion[]>;
  
  getQuestionsByLessonIds(lessonIds: string[]): Promise<IQuestion[]>;
  
  getQuestionsForTest(
    totalQuestions: number,
    lessonIds: mongoose.Types.ObjectId[]
  ): Promise<IQuestion[]>;
  
  getQuestionOrder(lessonId: string): Promise<number>;
  
  countQuestionsByLessonIds(lessonIds: string[]): Promise<number>;
  
  countDeletedQuestionsByLessonIds(lessonIds: string[]): Promise<number>;
} 