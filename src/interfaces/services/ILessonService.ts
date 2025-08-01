import { ILesson } from "../models/ILesson";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { ILessonLengthObject } from "../others/ILessonLengthObject";

export interface ILessonService {
  createLesson(
    courseId: string,
    name: string,
    description: string | undefined,
    length: ILessonLengthObject[]
  ): Promise<ILesson>;

  updateLesson(
    id: string,
    courseId?: string,
    name?: string,
    description?: string,
    length?: number
  ): Promise<ILesson | null>;

  deleteLesson(id: string): Promise<ILesson | null>;

  getLessons(query: IQuery): Promise<IPagination>;

  getLessonById(id: string, userId: string): Promise<ILesson | null>;

  getLessonsByCourseId(courseId: string, query: IQuery): Promise<IPagination>;
}
