import mongoose from "mongoose";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { ITest } from "../models/ITest";

export interface ITestRepository {
  createTest(data: object, session?: mongoose.ClientSession): Promise<ITest>;

  updateTest(
    testId: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ITest | null>;

  deleteTest(
    testId: string,
    session?: mongoose.ClientSession
  ): Promise<ITest | null>;

  getTestById(testId: string): Promise<ITest | null>;

  getTests(query: IQuery, courseId: string): Promise<IPagination>;

  // getTestsByUserId(userId: string, query: IQuery): Promise<IPagination>;

  getTestsByLessonId(lessonId: string, query: IQuery): Promise<IPagination>;

  getTestOrder(courseId: string): Promise<number>;

  getTestsByLessonIdV2(lessonId: string): Promise<ITest[]>;
}