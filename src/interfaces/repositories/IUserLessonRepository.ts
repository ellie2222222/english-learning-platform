import mongoose from "mongoose";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { IUserLesson } from "../models/IUserLesson";

export interface IUserLessonRepository {
  createUserLesson(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserLesson>;
  
  updateUserLesson(
    userLessonId: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserLesson | null>;

  deleteUserLesson(
    userLessonId: string,
    session?: mongoose.ClientSession
  ): Promise<IUserLesson | null>;

  getUserLessonById(userLessonId: string): Promise<IUserLesson | null>;

  getUserLessonsByUserId(userId: string, query: IQuery): Promise<IPagination>;

  checkExistingUserLesson(userId: string, lessonId: string): Promise<boolean>;
}