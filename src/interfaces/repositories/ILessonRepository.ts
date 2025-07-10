import mongoose from "mongoose";
import { ILesson } from "../models/ILesson";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface ILessonRepository {
  createLesson(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ILesson>;

  updateLesson(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ILesson | null>;

  deleteLesson(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<ILesson | null>;

  getLessons(query: IQuery): Promise<IPagination>;

  getLessonById(id: string): Promise<ILesson | null>;

  getLessonsByCourseId(courseId: string, query: IQuery): Promise<IPagination>;

  getLessonsByCourseIdV2(courseId: string): Promise<ILesson[]>;

  getCourseIdByLessonId(lessonId: string): Promise<string | null>;

  deleteLessonsByCourseId(
    courseId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean>;
}
