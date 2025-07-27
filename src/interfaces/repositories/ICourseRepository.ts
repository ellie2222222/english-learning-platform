import mongoose from "mongoose";
import { ICourse } from "../models/ICourse";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface ICourseRepository {
  createCourse(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ICourse>;

  updateCourse(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ICourse | null>;

  deleteCourse(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<ICourse | null>;

  getCourses(query: IQuery, type?: string): Promise<IPagination>;

  getCourseById(id: string): Promise<ICourse | null>;

  countActiveCourses(): Promise<number>;
}
