import { Inject, Service } from "typedi";
import { IUserLesson } from "../interfaces/models/IUserLesson";
import { IUserLessonService } from "../interfaces/services/IUserLessonService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import UserLessonRepository from "../repositories/UserLessonRepository";
import LessonRepository from "../repositories/LessonRepository";
import UserRepository from "../repositories/UserRepository";
import { UserLessonStatusType } from "../enums/UserLessonStatus";

@Service()
class UserLessonService implements IUserLessonService {
  constructor(
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository,
    @Inject() private database: Database
  ) {}

  async createUserLesson(
    userId: string,
    lessonId: string,
    currentOrder: number,
    status: string
  ): Promise<IUserLesson> {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const checkExistingUserLesson =
        await this.userLessonRepository.checkExistingUserLesson(
          userId,
          lessonId
        );
      if (checkExistingUserLesson) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "User lesson already exists"
        );
      }

      const userLesson = await this.userLessonRepository.createUserLesson(
        {
          userId,
          lessonId,
          currentOrder,
          status,
        },
        session
      );

      await this.database.commitTransaction(session);
      return userLesson;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create user lesson"
      );
    }
  }

  async updateUserLesson(
    userLessonId: string,
    status: string
  ): Promise<IUserLesson | null> {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.userLessonRepository.getUserLessonById(
        userLessonId
      );
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User lesson not found"
        );
      }

      const updateData: Partial<IUserLesson> = {};
      if (status !== undefined) updateData.status = status as UserLessonStatusType;

      const updatedUserLesson =
        await this.userLessonRepository.updateUserLesson(
          userLessonId,
          updateData,
          session
        );
      if (!updatedUserLesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User lesson not found"
        );
      }

      await this.database.commitTransaction(session);
      return updatedUserLesson;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update user lesson"
      );
    }
  }

  async deleteUserLesson(id: string): Promise<IUserLesson | null> {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.userLessonRepository.getUserLessonById(id);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User lesson not found"
        );
      }

      const deletedUserLesson =
        await this.userLessonRepository.updateUserLesson(
          id,
          { isDeleted: true },
          session
        );
      await this.database.commitTransaction(session);
      return deletedUserLesson;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete user lesson"
      );
    }
  }

  async getUserLessonById(userLessonId: string): Promise<IUserLesson | null> {
    try {
      const lesson = await this.userLessonRepository.getUserLessonById(
        userLessonId
      );
      return lesson;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve user lesson"
      );
    }
  }

  async getUserLessonsByUserId(
    userId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const lessons = await this.userLessonRepository.getUserLessonsByUserId(
        userId,
        query
      );
      return lessons;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve user lessons"
      );
    }
  }
}

export default UserLessonService;
