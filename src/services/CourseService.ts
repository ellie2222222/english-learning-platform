import { Inject, Service } from "typedi";
import { ICourse } from "../interfaces/models/ICourse";
import { ICourseService } from "../interfaces/services/ICourseService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { ICourseRepository } from "../interfaces/repositories/ICourseRepository";
import CourseRepository from "../repositories/CourseRepository";
import { IPagination } from "../interfaces/others/IPagination";
import { cleanUpFile } from "../utils/fileUtils";
import LessonRepository from "../repositories/LessonRepository";
import GrammarRepository from "../repositories/GrammarRepository";
import VocabularyRepository from "../repositories/VocabularyRepository";
import TestRepository from "../repositories/TestRepository";
import ExerciseRepository from "../repositories/ExcerciseRepository";
import { Types } from "mongoose";

@Service()
class CourseService implements ICourseService {
  constructor(
    @Inject(() => CourseRepository)
    private courseRepository: ICourseRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: LessonRepository,
    @Inject(() => GrammarRepository)
    private grammarRepository: GrammarRepository,
    @Inject(() => VocabularyRepository)
    private vocabularyRepository: VocabularyRepository,
    @Inject(() => TestRepository)
    private testRepository: TestRepository,
    @Inject(() => ExerciseRepository)
    private exerciseRepository: ExerciseRepository,
    @Inject() private database: Database
  ) {}

  async createCourse(
    name: string,
    description: string | undefined,
    type: string,
    level: string,
    totalLessons: number | undefined,
    coverImage?: string | undefined,
  ): Promise<ICourse> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.courseRepository.createCourse(
        {
          name,
          description,
          type,
          level,
          totalLessons,
          coverImage,
        },
        session
      );
 
      if (coverImage) {
        await cleanUpFile(coverImage, "create");
      }

      await this.database.commitTransaction(session);
      return course;
    } catch (error) {
      if (coverImage) {
        await cleanUpFile(coverImage, "create");
      }
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create course"
      );
    } finally {
      await session.endSession();
    }
  }

  async updateCourse(
    id: string,
    name?: string,
    description?: string,
    type?: string,
    level?: string,
    totalLessons?: number,
    coverImage?: string | undefined,
  ): Promise<ICourse | null> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.courseRepository.getCourseById(id);
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      const updateData: Partial<ICourse> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (level !== undefined) updateData.level = level;
      if (totalLessons !== undefined) updateData.totalLessons = totalLessons;
      if (coverImage !== undefined) updateData.coverImage = coverImage;

      const updatedCourse = await this.courseRepository.updateCourse(
        id,
        updateData,
        session
      );
      if (!updatedCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      if (coverImage && course.coverImage) {
        await cleanUpFile(course.coverImage, "update");
      }

      if (coverImage) {
        await cleanUpFile(coverImage, "create");
      }

      await this.database.commitTransaction(session);
      return updatedCourse;
    } catch (error) {
      if (coverImage) {
        await cleanUpFile(coverImage, "create");
      }
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update course"
      );
    } finally {
      await session.endSession();
    }
  }

  async deleteCourse(id: string): Promise<ICourse | null> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.courseRepository.getCourseById(id);
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      // Find all lessons associated with the course
    const lessons = await this.lessonRepository.getLessonsByCourseIdV2(id);

    // Extract lesson IDs
    const lessonIds: Types.ObjectId[] = lessons.map(lesson => lesson._id as Types.ObjectId);

    // Delete related data in parallel where possible
    await Promise.all([
      // Delete exercises associated with the lessons
      this.exerciseRepository.deleteExercisesByLessonIds(lessonIds, session),
      // Delete grammar documents associated with the lessons
      this.grammarRepository.deleteGrammarByLessonIds(lessonIds, session),
      // Delete vocabulary documents associated with the lessons
      this.vocabularyRepository.deleteVocabularyByLessonIds(lessonIds, session),
      // Delete tests associated with the course or lessons
      this.testRepository.deleteTestsByCourseOrLessons(id, lessonIds, session),
      // Delete lessons associated with the course
      this.lessonRepository.deleteLessonsByCourseId(id, session),
    ]);


      const deletedCourse = await this.courseRepository.deleteCourse(
        id,
        session
      );
      await this.database.commitTransaction(session);
      return deletedCourse;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete course"
      );
    } finally {
      await session.endSession();
    }
  }

  async getCourseById(id: string): Promise<ICourse | null> {
    try {
      const course = await this.courseRepository.getCourseById(id);
      return course;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve course"
      );
    }
  }

  async getCourses(query: IQuery, type?: string): Promise<IPagination> {
    try {
      const courses = await this.courseRepository.getCourses(query, type);
      return courses;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve courses"
      );
    }
  }
}

export default CourseService;
