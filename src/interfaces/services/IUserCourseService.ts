import { IUserCourse } from "../models/IUserCourse";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IUserCourseService {
  createUserCourse(
    userId: string,
    courseId: string,
    currentOrder: number,
    status: string
  ): Promise<IUserCourse>;

  updateUserCourse(
    userCourseId: string,
    status?: string
  ): Promise<IUserCourse | null>;

  deleteUserCourse(userCourseId: string): Promise<IUserCourse | null>;

  getUserCourseById(userCourseId: string): Promise<IUserCourse | null>;

  getUserCoursesByUserId(userId: string, query: IQuery): Promise<IPagination>;
}
