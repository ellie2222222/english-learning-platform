import { IUserExercise } from "../models/IUserExercise";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IUserExerciseService {
  getUserExercise: (
    id: string,
    requesterId: string
  ) => Promise<IUserExercise | null>;

  getUserExercises: (
    query: IQuery,
    userId: string,
    requesterId: string
  ) => Promise<IPagination | null>;

  submitExercise: (
    exerciseId: string,
    userId: string,
    answer: string
  ) => Promise<{ userExercise: IUserExercise | null; message: string }>;

  getUserExerciseByExerciseId: (
    exerciseId: string,
    requesterId: string
  ) => Promise<IUserExercise | null>;
}
