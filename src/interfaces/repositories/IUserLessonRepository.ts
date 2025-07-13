import mongoose from "mongoose";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { IUserLesson } from "../models/IUserLesson";
import { ILesson } from "../models/ILesson";

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

  getExistingUserLesson(
    userId: string,
    lessonId: string
  ): Promise<IUserLesson | null>;

  getUserLessonForLessonAchievement(userId: string): Promise<IUserLesson[]>;

  markLessonAsCompleted(
    userId: string,
    lessonId: string,
    currentOrder: number,
    session?: mongoose.ClientSession
  ): Promise<IUserLesson | null>;

  countCompletedByUserId(userId: string): Promise<number>;

  getUserLessonBasedOnLessonIds(
    userId: string,
    courseLessons: ILesson[],
    session?: mongoose.ClientSession
  ): Promise<IUserLesson[]>;
}
