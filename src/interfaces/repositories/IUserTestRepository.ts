import mongoose from "mongoose";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { IUserTest } from "../models/IUserTest";
import { ITest } from "../models/ITest";

export interface IUserTestRepository {
  createUserTest(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserTest>;

  updateUserTest(
    userTestId: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserTest | null>;

  deleteUserTest(
    userTestId: string,
    session?: mongoose.ClientSession
  ): Promise<IUserTest | null>;

  getUserTestById(userTestId: string): Promise<IUserTest | null>;

  getUserTestsByUserId(userId: string, query: IQuery): Promise<IPagination>;

  getUserTestsByTestId(testId: string, query: IQuery): Promise<IPagination>;

  getUserTestByTestUserAndAttempt(
    testId: string,
    userId: string,
    attemptNo: number
  ): Promise<IUserTest | null>;

  getUserTestByTestId(
    testId: string,
    requesterId: string
  ): Promise<IUserTest | null>;

  getLatestAttempt(userId: string, lessonId: string): Promise<IUserTest | null>;

  countCompletedByUserId(userId: string): Promise<number>;

  countUserTestByUserId(userId: string): Promise<number>;

  getUserTestsByTestIds(
    userId: string,
    courseTests: ITest[],
    session?: mongoose.ClientSession
  ): Promise<IUserTest[]>;
}
