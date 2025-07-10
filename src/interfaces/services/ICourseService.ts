import { ICourse } from "../models/ICourse";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { ILesson } from "../models/ILesson";
import { ITest } from "../models/ITest";
import { IExercise } from "../models/IExercise";
import { IGrammar } from "../models/IGrammar";
import { IVocabulary } from "../models/IVocabulary";

export interface ICourseDetails extends ICourse {
  lessons: Array<{
    lesson: ILesson;
    vocabularies: IVocabulary[];
    grammars: IGrammar[];
    exercises: IExercise[];
    tests: ITest[];
  }>;
  courseTests: ITest[];
}

export interface ICourseService {
  createCourse(
    name: string,
    description: string | undefined,
    type: string,
    level: string,
    totalLessons: number | undefined,
    coverImage?: string | undefined
  ): Promise<ICourse>;

  updateCourse(
    id: string,
    name?: string,
    description?: string,
    type?: string,
    level?: string,
    totalLessons?: number,
    coverImage?: string | undefined
  ): Promise<ICourse | null>;

  deleteCourse(id: string): Promise<ICourse | null>;

  getCourses(query: IQuery, type?: string): Promise<IPagination>;

  getCourseById(id: string): Promise<ICourse | null>;

  getCourseDetails(id: string): Promise<ICourseDetails | null>;
}
