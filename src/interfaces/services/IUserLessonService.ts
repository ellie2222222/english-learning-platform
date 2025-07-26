import { IUserLesson } from "../models/IUserLesson";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { ILessonTracking } from "../others/ILessonTracking";

export interface IUserLessonService {
  createUserLesson(
    userId: string,
    lessonId: string,
    currentOrder: ILessonTracking[],
    status: string
  ): Promise<IUserLesson>;

  updateUserLesson(
    userLessonId: string,
    userId: string,
    status: string
  ): Promise<IUserLesson | null>;

  deleteUserLesson(id: string): Promise<IUserLesson | null>;

  getUserLessonById(userLessonId: string): Promise<IUserLesson | null>;

  getUserLessonsByUserId(
    userId: string,
    query: IQuery
  ): Promise<IPagination>;

  getUserLessonsByCourseId(
    userId: string,
    courseId: string
  ): Promise<IUserLesson[]>;

  getUserLessonByLessonId(
    lessonId: string,
    userId: string
  ): Promise<IUserLesson>;

  checkUserLessonCompletion(
    lessonId: string,
    userId: string,
    points: number
  ): Promise<void>;
}
