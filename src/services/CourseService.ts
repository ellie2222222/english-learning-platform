import { Inject, Service } from "typedi";
import { ICourse } from "../interfaces/models/ICourse";
import {
  ICourseService,
  ICourseDetails,
} from "../interfaces/services/ICourseService";
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
import { ILesson } from "../interfaces/models/ILesson";
import { IVocabularyRepository } from "../interfaces/repositories/IVocabularyRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import { IGrammarRepository } from "../interfaces/repositories/IGrammarRepository";
import { ITestRepository } from "../interfaces/repositories/ITestRepository";
import { IExerciseRepository } from "../interfaces/repositories/IExerciseRepository";

@Service()
class CourseService implements ICourseService {
  constructor(
    @Inject(() => CourseRepository)
    private courseRepository: ICourseRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => GrammarRepository)
    private grammarRepository: IGrammarRepository,
    @Inject(() => VocabularyRepository)
    private vocabularyRepository: IVocabularyRepository,
    @Inject(() => TestRepository)
    private testRepository: ITestRepository,
    @Inject(() => ExerciseRepository)
    private exerciseRepository: IExerciseRepository,
    @Inject() private database: Database
  ) {}

  async createCourse(
    name: string,
    description: string | undefined,
    type: string,
    level: string,
    totalLessons: number | undefined = 0,
    coverImage?: string | undefined
  ): Promise<ICourse> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.courseRepository.createCourse(
        {
          name,
          description,
          type,
          level,
          totalLessons: totalLessons || 0,
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
    coverImage?: string | undefined
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
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (type) updateData.type = type;
      if (level) updateData.level = level;
      if (totalLessons) updateData.totalLessons = totalLessons;
      if (coverImage) updateData.coverImage = coverImage;

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
      const lessonIds: Types.ObjectId[] = lessons.map(
        (lesson) => lesson._id as Types.ObjectId
      );

      // Delete related data sequentially to maintain transaction integrity
      // 1. Delete exercises first as they depend on lessons
      await this.exerciseRepository.deleteExercisesByLessonIds(
        lessonIds,
        session
      );

      // 2. Delete grammar documents
      await this.grammarRepository.deleteGrammarByLessonIds(lessonIds, session);

      // 3. Delete vocabulary documents
      await this.vocabularyRepository.deleteVocabularyByLessonIds(
        lessonIds,
        session
      );

      // 4. Delete tests
      await this.testRepository.deleteTestsByCourseOrLessons(
        id,
        lessonIds,
        session
      );

      // 5. Delete lessons
      await this.lessonRepository.deleteLessonsByCourseId(id, session);

      // 6. Finally, delete the course itself
      const deletedCourse = await this.courseRepository.deleteCourse(
        id,
        session
      );

      // Commit the transaction
      await this.database.commitTransaction(session);

      return deletedCourse;
    } catch (error) {
      // Abort the transaction if there's an error
      await this.database.abortTransaction(session);

      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete course"
      );
    } finally {
      // End the session in the finally block
      await this.database.endSession(session);
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

  async getCourseDetails(id: string): Promise<ICourseDetails | null> {
    try {
      // Get the course
      const course = await this.courseRepository.getCourseById(id);
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      // Get all lessons for the course
      const lessons = await this.lessonRepository.getLessonsByCourseIdV2(id);

      // Get course-level tests
      const courseTests = await this.testRepository.getTestsByCourseId(id);

      // Get details for each lesson
      const lessonDetails = await Promise.all(
        lessons.map(async (lesson) => {
          if (!lesson._id) {
            throw new CustomException(
              StatusCodeEnum.InternalServerError_500,
              "Invalid lesson data"
            );
          }
          const lessonId =
            typeof lesson._id === "string" ? lesson._id : lesson._id.toString();

          const exercises = await this.exerciseRepository.getAllLessonExercise(
            lessonId
          );
          const tests = await this.testRepository.getTestsByLessonIdV2(
            lessonId
          );

          const vocabularies =
            await this.vocabularyRepository.getAllVocabulariesByLessonId(
              lessonId
            );

          const grammars =
            await this.grammarRepository.getAllGrammarsByLessonId(lessonId);
          return {
            lesson,
            vocabularies,
            grammars,
            exercises,
            tests,
          };
        })
      );

      return {
        ...course.toObject(),
        lessons: lessonDetails,
        courseTests,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to get course details"
      );
    }
  }
}

export default CourseService;
