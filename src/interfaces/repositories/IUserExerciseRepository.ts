import mongoose from "mongoose";
import { IUserExercise } from "../models/IUserExercise";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IUserExerciseRepository {
  createUserExercise(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserExercise | null>;

  updateUserExercise(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserExercise | null>;

  deleteUserExercise(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IUserExercise | null>;

  getUserExercise(id: string): Promise<IUserExercise | null>;

  getUserExercises(userId: string, query: IQuery): Promise<IPagination>;

  getUserExerciseByExerciseId(
    userId: string,
    exerciseId: string
  ): Promise<IUserExercise | null>;

  getUserExercisesByLessonId(
    userId: string,
    lessonId: string
  ): Promise<IUserExercise[]>;
}
