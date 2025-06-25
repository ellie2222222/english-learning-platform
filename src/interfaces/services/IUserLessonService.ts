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
    status?: string
  ): Promise<IUserLesson | null>;

  deleteUserLesson(userLessonId: string): Promise<IUserLesson | null>;

  getUserLessonById(userLessonId: string): Promise<IUserLesson | null>;

  getUserLessonsByUserId(userId: string, query: IQuery): Promise<IPagination>;

  getUserLessonByLessonId: (
    lessonId: string,
    userId: string
  ) => Promise<IUserLesson>;
}
