import { ITest } from "../models/ITest";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { ISubmitTest, IUserTestResponse } from "../others/ISubmission";

export interface ITestService {
  createTest(
    name: string,
    lessonIds: string[],
    description: string,
    totalQuestions: number
  ): Promise<ITest>;

  updateTest(
    testId: string,
    lessonIds: string[],
    name?: string,
    description?: string,
    totalQuestions?: number
  ): Promise<ITest | null>;

  deleteTest(testId: string): Promise<ITest | null>;

  getTestById(testId: string): Promise<ITest | null>;

  getTests(query: IQuery, courseId: string): Promise<IPagination>;

  getTestsByLessonId(lessonId: string, query: IQuery): Promise<IPagination>;

  submitTest(
    data: ISubmitTest
  ): Promise<IUserTestResponse>;
}
