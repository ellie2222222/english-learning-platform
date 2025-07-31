import { IExercise } from "../models/IExercise";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { ISubmitExercises, IUserExerciseResponse } from "../others/ISubmission";

export interface IExerciseService {
  createExercise: (
    lessonId: string,
    questions: Array<{
      type: string;
      question: string;
      answer: string | string[];
      focus: string;
      options?: string[];
      explanation?: string;
      image?: string;
    }>
  ) => Promise<IExercise | null>;

  updateExercise: (
    id: string,
    questions: Array<{
      id?: string; // If provided, update existing question
      type: string;
      question: string;
      answer: string | string[];
      focus: string;
      options?: string[];
      explanation?: string;
      image?: string;
    }>
  ) => Promise<IExercise | null>;

  deleteExercise: (id: string) => Promise<IExercise | null>;

  getExercises: (query: IQuery, lessonId: string) => Promise<IPagination>;

  getExercise: (id: string) => Promise<IExercise | null>;
  
  submitExercises: (data: ISubmitExercises) => Promise<IUserExerciseResponse>;
}
