import mongoose from "mongoose";
import { IExercise } from "../models/IExercise";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IExerciseRepository {
  createExercise(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IExercise | null>;

  updateExercise(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IExercise | null>;

  deleteExercise(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IExercise | null>;

  getExercise(id: string): Promise<IExercise | null>;

  getExercises(query: IQuery, lessonId?: string): Promise<IPagination>;

  getExercisesForTest(
    length: number,
    lessonIds: mongoose.Types.ObjectId[]
  ): Promise<IExercise[]>;

  getAllLessonExercise(lessonId: string): Promise<IExercise[]>;

  deleteExercisesByLessonId(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<boolean>;

  deleteExercisesByLessonIds(
    lessonIds: mongoose.Types.ObjectId[],
    session?: mongoose.ClientSession
  ): Promise<boolean>;

  getExerciseOrder(lessonId: string): Promise<number>;

  countExercisesByLessonIds(
    lessonIds: mongoose.Types.ObjectId[] | string[],
  ): Promise<number>;

  countDeletedExercisesByLessonIds(
    lessonIds: mongoose.Types.ObjectId[] | string[],
  ): Promise<number>;
}
