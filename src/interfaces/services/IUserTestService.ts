import { IUserTest } from "../models/IUserTest";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { UserTestStatusEnumType } from "../../enums/UserTestStatusEnum";

export interface IUserTestService {
  createUserTest(
    testId: string,
    userId: string,
    attemptNo: number,
    score: number,
    status: UserTestStatusEnumType,
    description: string,
  ): Promise<IUserTest>;

  deleteUserTest(userTestId: string): Promise<IUserTest | null>;

  getUserTestById(userTestId: string): Promise<IUserTest | null>;

  getUserTestsByTestId(testId: string, query: IQuery): Promise<IPagination>;

  getUserTestsByUserId(userId: string, query: IQuery): Promise<IPagination>;
}