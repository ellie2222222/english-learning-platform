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
import ExerciseRepository from "../repositories/ExcerciseRepository";
import { IExerciseRepository } from "../interfaces/repositories/IExerciseRepository";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import {
  ISubmitTest,
  IUserTestResponse,
} from "../interfaces/others/ISubmission";
import { IExercise } from "../interfaces/models/IExercise";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import { UserTestStatusEnum } from "../enums/UserTestStatusEnum";
import { IUserTest } from "../interfaces/models/IUserTest";
import UserTestRepository from "../repositories/UserTestRepository";
import { IUserTestRepository } from "../interfaces/repositories/IUserTestRepository";
import ConfigService from "./ConfigService";
import { IConfigService } from "../interfaces/services/IConfigService";
import { error } from "console";
import { UserLessonStatus } from "../enums/UserLessonStatus";
import { UserCourseStatus } from "../enums/UserCourseStatus";
import UserLessonModel from "../models/UserLessonModel";
import UserCourseModel from "../models/UserCourseModel";
import UserTestModel from "../models/UserTestModel";
import { ILesson } from "../interfaces/models/ILesson";
import increaseUserPoint from "../utils/userPoint";
import { IncreasePointEnum } from "../enums/IncreasePointEnum";

@Service()
class TestService implements ITestService {
  constructor(
    @Inject(() => TestRepository)
    private testRepository: ITestRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => ExerciseRepository)
    private exerciseRepository: IExerciseRepository,
    @Inject(() => UserTestRepository)
    private userTestRepository: IUserTestRepository,
    @Inject(() => ConfigService)
    private configService: IConfigService,
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
          // console.log(
          //   courseId === lesson.courseId.toString(),
          //   courseId,
          //   lesson.courseId,
          //   typeof courseId,
          //   typeof lesson.courseId.toString()
          // );
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

   async submitTest(data: ISubmitTest): Promise<IUserTestResponse> {
    const session = await this.database.startTransaction();
    try {
      // Validate test exists
      const test = await this.testRepository.getTestById(data.testId);
      if (!test) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Test not found");
      }

      // Get exercises for the test's lessons
      const exercises = await this.exerciseRepository.getExercisesByLessonIds(test.lessonIds.map((id) => id.toString()));

      // Validate all submitted exercise IDs belong to the test's lessons
      const exerciseIds = exercises.map((ex: IExercise) => (ex._id as mongoose.Types.ObjectId)?.toString());
      const invalidExerciseIds = data.answers.filter(
        (ans) => !exerciseIds.includes(ans.exerciseId)
      );
      if (invalidExerciseIds.length > 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid exercise IDs in submission"
        );
      }

      // Grade the submission
      let correctAnswers = 0;
      const results = data.answers.map((answer) => {
        const exercise = exercises.find(
          (ex: IExercise) => (ex._id as mongoose.Types.ObjectId)?.toString() === answer.exerciseId?.toString()
        )!;
        let isCorrect: boolean;

        // Handle grading based on exercise type
        switch (exercise.type) {
          case ExerciseTypeEnum.MULTIPLE_CHOICE:
            // Exact match for multiple-choice answers
            isCorrect =
              answer.selectedAnswers.length === exercise.answer.length &&
              answer.selectedAnswers.every((ans) =>
                exercise.answer.includes(ans)
              );
            break;
          case ExerciseTypeEnum.TRANSLATE:
          case ExerciseTypeEnum.IMAGE_TRANSLATE:
            // Case-insensitive match for translation answers
            isCorrect =
              answer.selectedAnswers.length === 1 &&
              exercise.answer.length === 1 &&
              answer.selectedAnswers[0].toLowerCase().trim() ===
                exercise.answer[0].toLowerCase().trim();
            break;
          case ExerciseTypeEnum.FILL_IN_THE_BLANK:
            // Exact match for fill-in-the-blank answers
            isCorrect =
              answer.selectedAnswers.length === exercise.answer.length &&
              answer.selectedAnswers.every(
                (ans, idx) => ans.trim() === exercise.answer[idx].trim()
              );
            break;
          default:
            isCorrect = false;
        }

        if (isCorrect) correctAnswers++;
        return {
          exerciseId: answer.exerciseId,
          selectedAnswers: answer.selectedAnswers,
          correctAnswers: Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer],
          isCorrect,
        };
      });

      // Calculate score (percentage)
      const score = Math.round((correctAnswers / test.totalQuestions) * 100);

      // Get passing point from config (default to 80 if not found)
      let passingPoint = 80;
      try {
        const config = await this.configService.getConfig('test_passing_point');
        passingPoint = parseInt(config.value, 10);
      } catch (configError) {
        // Use default value if config not found
        console.log("Using default passing point:", passingPoint);
      }

      // Determine status based on score and passing point
      const status =
        score >= passingPoint ? UserTestStatusEnum.PASSED : UserTestStatusEnum.FAILED;

      // Get the latest attempt number
      const lastAttempt = await this.userTestRepository.getLatestAttempt(
        data.userId,
        data.testId
      );
      const attemptNo = lastAttempt ? lastAttempt.attemptNo + 1 : 1;

      // Create submission
      const submission: Partial<IUserTest> = {
        userId: new mongoose.Schema.Types.ObjectId(data.userId),
        testId: new mongoose.Schema.Types.ObjectId(data.testId),
        attemptNo,
        score,
        status,
        description: status === UserTestStatusEnum.PASSED ? "Test passed successfully" : "Test failed"
      };

      // Save submission
      const savedSubmission = await this.userTestRepository.createUserTest(
        submission,
        session
      );

      // Update user course status if test is passed
      if (status === UserTestStatusEnum.PASSED) {
        await this.updateUserCourseStatus(data.userId, test.courseId.toString(), session);
        await increaseUserPoint(data.userId, IncreasePointEnum.TEST);
      }
 
      await this.database.commitTransaction(session);
 
      return {
        id: savedSubmission._id!.toString(),
        userId: savedSubmission.userId.toString(),
        testId: savedSubmission.testId.toString(),
        attemptNo: savedSubmission.attemptNo,
        score: savedSubmission.score,
        status: savedSubmission.status,
        description: savedSubmission.description,
        submittedAt: savedSubmission.createdAt!,
        results,
      };
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to submit test"
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates the user course status based on lesson completion and test results
   * @param userId User ID
   * @param courseId Course ID
   * @param session MongoDB session for transaction
   */
  private async updateUserCourseStatus(
    userId: string,
    courseId: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      // 1. Get all lessons for the course
      const courseLessons = await this.lessonRepository.getLessonsByCourseIdV2(courseId);
      
      // 2. Check if all lessons are completed by the user
      const userLessons = await UserLessonModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        lessonId: { $in: courseLessons.map((lesson: ILesson) => lesson._id) },
      });
      
      const allLessonsCompleted = courseLessons.length > 0 && 
        userLessons.length === courseLessons.length &&
        userLessons.every(userLesson => userLesson.status === UserLessonStatus.COMPLETED);
      
      // 3. Get all tests for the course directly
      const courseTests = await this.testRepository.getTestsByCourseId(courseId);
      
      // 4. Check if all tests are passed by the user
      const userTests = await UserTestModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        testId: { $in: courseTests.map(test => test._id) },
        status: UserTestStatusEnum.PASSED,
      }).sort({ createdAt: -1 }).lean();
      
      // Count unique test IDs that have been passed
      const passedTestIds = new Set<string>();
      for (const test of userTests as any[]) {
        passedTestIds.add(test.testId.toString());
      }
      
      const allTestsPassed = courseTests.length > 0 &&
        passedTestIds.size === courseTests.length;
      
      // 5. Update user course status
      const newStatus = (allLessonsCompleted && allTestsPassed) 
        ? UserCourseStatus.COMPLETED 
        : UserCourseStatus.ONGOING;
      
      // Find or create user course record
      const userCourse = await UserCourseModel.findOneAndUpdate(
        {
          userId: new mongoose.Types.ObjectId(userId),
          courseId: new mongoose.Types.ObjectId(courseId),
        },
        {
          $set: {
            status: newStatus,
            lessonFinished: userLessons.filter(
              ul => ul.status === UserLessonStatus.COMPLETED
            ).length,
          }
        },
        { upsert: true, new: true, session }
      );
      
      // Calculate and update average score if there are passed tests
      if (userTests.length > 0) {
        const totalScore = userTests.reduce((sum: number, test: IUserTest) => sum + test.score, 0);
        const averageScore = Math.round(totalScore / userTests.length);
        
        await UserCourseModel.findByIdAndUpdate(
          userCourse._id,
          { $set: { averageScore } },
          { session }
        );
      }
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update user course status"
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
