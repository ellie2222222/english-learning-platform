import { Inject, Service } from "typedi";
import { ILesson } from "../interfaces/models/ILesson";
import { ILessonService } from "../interfaces/services/ILessonService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import LessonRepository from "../repositories/LessonRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import UserLessonRepository from "../repositories/UserLessonRepository";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";
import mongoose from "mongoose";

@Service()
class LessonService implements ILessonService {
  constructor(
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository,
    @Inject() private database: Database
  ) {}

  async createLesson(
    courseId: string,
    name: string,
    description: string | undefined,
    length: number
  ): Promise<ILesson> {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.lessonRepository.createLesson(
        {
          courseId,
          name,
          description,
          length,
        },
        session
      );

      await this.database.commitTransaction(session);
      return lesson;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create lesson"
      );
    } finally {
      await session.endSession();
    }
  }

  async updateLesson(
    id: string,
    courseId?: string,
    name?: string,
    description?: string,
    length?: number
  ): Promise<ILesson | null> {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.lessonRepository.getLessonById(id);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const updateData: Partial<ILesson> = {};
      if (courseId !== undefined) updateData.courseId = courseId;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (length !== undefined) updateData.length = length;

      const updatedLesson = await this.lessonRepository.updateLesson(
        id,
        updateData,
        session
      );
      if (!updatedLesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      await this.database.commitTransaction(session);
      return updatedLesson;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update lesson"
      );
    } finally {
      await session.endSession();
    }
  }

  async deleteLesson(id: string): Promise<ILesson | null> {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.lessonRepository.getLessonById(id);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const deletedLesson = await this.lessonRepository.updateLesson(
        id,
        { isDeleted: true },
        session
      );
      await this.database.commitTransaction(session);
      return deletedLesson;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete lesson"
      );
    } finally {
      await session.endSession();
    }
  }

  async getLessonById(id: string, userId: string): Promise<ILesson | null> {
    try {
      const lesson = await this.lessonRepository.getLessonById(id);
      const checkUserLesson =
        await this.userLessonRepository.getExistingUserLesson(userId, id);

      if (!checkUserLesson) {
        await this.userLessonRepository.createUserLesson({
          lessonId: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(userId),
        });
      }

      return lesson;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve lesson"
      );
    }
  }

  async getLessons(query: IQuery): Promise<IPagination> {
    try {
      const lessons = await this.lessonRepository.getLessons(query);
      return lessons;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve lessons"
      );
    }
  }

  async getLessonsByCourseId(
    courseId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const lessons = await this.lessonRepository.getLessonsByCourseId(
        courseId,
        query
      );
      return lessons;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve lessons"
      );
    }
  }
}

export default LessonService;
