import { Inject, Service } from "typedi";
import { IUserTest } from "../interfaces/models/IUserTest";
import { IUserTestService } from "../interfaces/services/IUserTestService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import { IUserTestRepository } from "../interfaces/repositories/IUserTestRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import UserTestRepository from "../repositories/UserTestRepository";
import LessonRepository from "../repositories/LessonRepository"; 
import UserRepository from "../repositories/UserRepository";
import { UserTestStatusEnumType } from "../enums/UserTestStatusEnum";
import TestRepository from "../repositories/TestRepository";
import { ITestRepository } from "../interfaces/repositories/ITestRepository";

@Service()
class UserTestService implements IUserTestService {
  constructor(
    @Inject(() => UserTestRepository)
    private userTestRepository: IUserTestRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository,
    @Inject(() => TestRepository)
    private testRepository: ITestRepository,
    @Inject() private database: Database
  ) {}

  async createUserTest(
    testId: string,
    userId: string,
    attemptNo: number,
    score: number,
    status: UserTestStatusEnumType,
    description: string,
  ): Promise<IUserTest> {
    const session = await this.database.startTransaction();
    try {
      // Validate test ID
      const test = await this.testRepository.getTestById(testId);
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Test with ID ${testId} not found`
        );
      }

      // Validate user ID
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `User with ID ${userId} not found`
        );
      }

      // Check if userTest with same testId, userId, and attemptNo exists
      const existingUserTest = await this.userTestRepository.getUserTestByTestUserAndAttempt(testId, userId, attemptNo);
      if (existingUserTest) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          `UserTest for this test, user, and attempt number already exists`
        );
      }

      const userTest = await this.userTestRepository.createUserTest(
        {
          testId,
          userId,
          attemptNo,
          score,
          status,
          description,
        },
        session
      );

      await this.database.commitTransaction(session);
      return userTest;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create userTest"
      );
    }
  }

  async deleteUserTest(userTestId: string): Promise<IUserTest | null> {
    const session = await this.database.startTransaction();
    try {
      const userTest = await this.userTestRepository.getUserTestById(userTestId);
      if (!userTest) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserTest not found"
        );
      }

      const deletedUserTest = await this.userTestRepository.updateUserTest(
        userTestId,
        { isDeleted: true },
        session
      );
      await this.database.commitTransaction(session);
      return deletedUserTest;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete userTest"
      );
    }
  }

  async getUserTestById(userTestId: string): Promise<IUserTest | null> {
    try {
      const userTest = await this.userTestRepository.getUserTestById(userTestId);
      if (!userTest) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserTest not found"
        );
      }
      return userTest;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve userTest"
      );
    }
  }

  async getUserTestsByTestId(testId: string, query: IQuery): Promise<IPagination> {
    try {
      const test = await this.testRepository.getTestById(testId);
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const userTests = await this.userTestRepository.getUserTestsByTestId(testId, query);
      return userTests;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve userTests"
      );
    }
  }

  async getUserTestsByUserId(userId: string, query: IQuery): Promise<IPagination> {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const userTests = await this.userTestRepository.getUserTestsByUserId(userId, query);
      return userTests;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve userTests"
      );
    }
  }
}

export default UserTestService;