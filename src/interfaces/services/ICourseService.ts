import { ICourse } from "../models/ICourse";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface ICourseService {
  createCourse(
    name: string,
    description: string | undefined,
    type: string,
    level: string,
    totalLessons: number | undefined
  ): Promise<ICourse>;

  updateCourse(
    id: string,
    name?: string,
    description?: string,
    type?: string,
    level?: string,
    totalLessons?: number
  ): Promise<ICourse | null>;

  deleteCourse(id: string): Promise<ICourse | null>;

  getCourses(query: IQuery, type?: string): Promise<IPagination>;

  getCourseById(id: string): Promise<ICourse | null>;
}