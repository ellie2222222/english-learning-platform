import { Inject, Service } from "typedi";
import { ITest } from "../interfaces/models/ITest";
import { ITestService } from "../interfaces/services/ITestService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import { ITestRepository } from "../interfaces/repositories/ITestRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import TestRepository from "../repositories/TestRepository";
import LessonRepository from "../repositories/LessonRepository";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import ExerciseRepository from "../repositories/ExcerciseRepository";
import { IExerciseRepository } from "../interfaces/repositories/IExerciseRepository";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

@Service()
class TestService implements ITestService {
  constructor(
    @Inject(() => TestRepository)
    private testRepository: ITestRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository,
    @Inject(() => ExerciseRepository)
    private exerciseRepository: IExerciseRepository,
    @Inject() private database: Database
  ) {}

  async createTest(
    name: string,
    lessonIds: string[],
    description: string,
    totalQuestions: number
  ): Promise<ITest> {
    const session = await this.database.startTransaction();
    let courseId: string | null = null;
    try {
      // Validate lesson IDs
      for (const lessonId of lessonIds) {
        const lesson = await this.lessonRepository.getLessonById(lessonId);
        if (!lesson) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            `Lesson with ID ${lessonId} not found`
          );
        }

        if (courseId === null) {
          courseId = lesson.courseId.toString();
        } else if (courseId !== lesson.courseId.toString()) {
          console.log(
            courseId === lesson.courseId.toString(),
            courseId,
            lesson.courseId,
            typeof courseId,
            typeof lesson.courseId.toString()
          );
          throw new CustomException(
            StatusCodeEnum.Conflict_409,
            "A test's lessonIds must be inside the same course"
          );
        }
      }

      const lessonObjectIds = lessonIds.map((id: any) =>
        typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
      );

      const exercise = await this.exerciseRepository.getExercisesForTest(
        totalQuestions,
        lessonObjectIds
      );

      if (exercise.length < totalQuestions) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Not enough exercises for test`
        );
      }

      const order = await this.testRepository.getTestOrder(courseId as string);
      const test = await this.testRepository.createTest(
        {
          name,
          description,
          totalQuestions,
          lessonIds,
          courseId: new ObjectId(courseId as string),
          order,
        },
        session
      );

      await this.database.commitTransaction(session);
      return test;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create test"
      );
    }
  }

  async updateTest(
    testId: string,
    lessonIds: string[],
    name: string,
    description: string,
    totalQuestions: number
  ): Promise<ITest | null> {
    const session = await this.database.startTransaction();
    try {
      const test = await this.testRepository.getTestById(testId);
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }

      let courseId: string | null = null;
      if (lessonIds) {
        for (const lessonId of lessonIds) {
          const lesson = await this.lessonRepository.getLessonById(lessonId);
          if (!lesson) {
            throw new CustomException(
              StatusCodeEnum.NotFound_404,
              `Lesson with ID ${lessonId} not found`
            );
          }

          if (courseId !== null) {
            courseId = lesson.courseId.toString();
          }

          if (courseId?.toString() !== lesson.courseId.toString()) {
            throw new CustomException(
              StatusCodeEnum.Conflict_409,
              "A test's lessonIds must be inside the same course"
            );
          }
        }
      }
      // Validate lesson IDs
      for (const lessonId of lessonIds) {
        const lesson = await this.lessonRepository.getLessonById(lessonId);
        if (!lesson) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            `Lesson with ID ${lessonId} not found`
          );
        }
      }

      if (totalQuestions && totalQuestions !== test.totalQuestions) {
        const lessonObjectIds = lessonIds.map((id: any) =>
          typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
        );

        const exercise = await this.exerciseRepository.getExercisesForTest(
          totalQuestions,
          lessonObjectIds
        );

        if (exercise.length < totalQuestions) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            `Not enough exercises for test`
          );
        }
      }

      const updateData = {
        lessonIds,
        name,
        description,
        totalQuestions,
        courseId: new ObjectId(courseId as string),
      };

      const updatedTest = await this.testRepository.updateTest(
        testId,
        updateData,
        session
      );
      if (!updatedTest) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }

      await this.database.commitTransaction(session);
      return updatedTest;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update test"
      );
    }
  }

  async deleteTest(testId: string): Promise<ITest | null> {
    const session = await this.database.startTransaction();
    try {
      const test = await this.testRepository.getTestById(testId);
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }

      const deletedTest = await this.testRepository.updateTest(
        testId,
        { isDeleted: true },
        session
      );
      await this.database.commitTransaction(session);
      return deletedTest;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete test"
      );
    }
  }

  async getTestById(testId: string): Promise<ITest | null> {
    try {
      const test = await this.testRepository.getTestById(testId);

      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }

      const lessonObjectIds = test.lessonIds.map((id: any) =>
        typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
      );

      const exercises = await this.exerciseRepository.getExercisesForTest(
        test.totalQuestions,
        lessonObjectIds
      );

      test.exercises = exercises;
      return test;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve test"
      );
    }
  }

  async getTests(query: IQuery, courseId: string): Promise<IPagination> {
    try {
      const tests = await this.testRepository.getTests(query, courseId);
      return tests;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve tests"
      );
    }
  }

  async getTestsByLessonId(
    lessonId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const tests = await this.testRepository.getTestsByLessonId(
        lessonId,
        query
      );
      return tests;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve tests"
      );
    }
  }

  // async getTestsByUserId(userId: string, query: IQuery): Promise<IPagination> {
  //   try {
  //     const user = await this.userRepository.getUserById(userId);
  //     if (!user) {
  //       throw new CustomException(
  //         StatusCodeEnum.NotFound_404,
  //         "Lesson not found"
  //       );
  //     }

  //     const tests = await this.testRepository.getTestsByUserId(userId, query);
  //     return tests;
  //   } catch (error) {
  //     if (error instanceof CustomException) {
  //       throw error;
  //     }
  //     throw new CustomException(
  //       StatusCodeEnum.InternalServerError_500,
  //       error instanceof Error ? error.message : "Failed to retrieve tests"
  //     );
  //   }
  // }
}

export default TestService;
