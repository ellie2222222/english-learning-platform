import mongoose, { ClientSession } from "mongoose";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { IUserCourse } from "../models/IUserCourse";
import { UserCourseStatusType } from "../../enums/UserCourseStatus";
import { IUserLesson } from "../models/IUserLesson";

export interface IUserCourseRepository {
  createUserCourse(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse>;

  updateUserCourse(
    userCourseId: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse | null>;

  deleteUserCourse(
    userCourseId: string,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse | null>;

  getUserCourseById(userCourseId: string): Promise<IUserCourse | null>;

  getUserCoursesByUserId(userId: string, query: IQuery): Promise<IPagination>;

  getUserProgressHierarchy(userId: string): Promise<object[]>;

  getUserCourseForAchievement(
    userId: string,
    session?: ClientSession
  ): Promise<IUserCourse[]>;

  getUserCourseByCourseId(
    id: string,
    requesterId: string
  ): Promise<IUserCourse | null>;

  countCompletedByUserId(userId: string): Promise<number>;

  getAllUserCourses(): Promise<IUserCourse[]>;

  completeCourseLogic(
    userId: string,
    courseId: string,
    newStatus: UserCourseStatusType,
    userLessons: IUserLesson[],
    averageScore?: number,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse>;
}
