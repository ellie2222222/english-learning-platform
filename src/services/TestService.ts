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
import { IQuestionRepository } from "../interfaces/repositories/IQuestionRepository";
import TestRepository from "../repositories/TestRepository";
import LessonRepository from "../repositories/LessonRepository";
import QuestionRepository from "../repositories/QuestionRepository";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import {
  ISubmitTest,
  IUserTestResponse,
} from "../interfaces/others/ISubmission";
import { IQuestion } from "../interfaces/models/IQuestion";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import { UserTestStatusEnum } from "../enums/UserTestStatusEnum";
import { IUserTest } from "../interfaces/models/IUserTest";
import UserTestRepository from "../repositories/UserTestRepository";
import { IUserTestRepository } from "../interfaces/repositories/IUserTestRepository";
import ConfigService from "./ConfigService";
import { IConfigService } from "../interfaces/services/IConfigService";
import { UserLessonStatus } from "../enums/UserLessonStatus";
import { UserCourseStatus } from "../enums/UserCourseStatus";
import UserLessonModel from "../models/UserLessonModel";
import UserCourseModel from "../models/UserCourseModel";
import UserTestModel from "../models/UserTestModel";
import { ILesson } from "../interfaces/models/ILesson";
import increaseUserPoint from "../utils/userPoint";
import { IncreasePointEnum } from "../enums/IncreasePointEnum";
import { notifyAchievement } from "../utils/mailer";
import UserCourseRepository from "../repositories/UserCourseRepository";
import { IUserCourseRepository } from "../interfaces/repositories/IUserCourseRepository";
import AchievementRepository from "../repositories/AchievementRepository";
import { IAchievementRepository } from "../interfaces/repositories/IAchievementRepository";
import UserAchievementRepository from "../repositories/UserAchievementRepository";
import { IUserAchievementRepository } from "../interfaces/repositories/IUserAchievementRepository";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { AchievementTypeEnum } from "../enums/AchievementTypeEnum";
import getLogger from "../utils/logger";
import CourseRepository from "../repositories/CourseRepository";
import { ICourseRepository } from "../interfaces/repositories/ICourseRepository";
import { ExerciseFocusEnum } from "../enums/ExerciseFocusEnum";
import UserLessonRepository from "../repositories/UserLessonRepository";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";

@Service()
class TestService implements ITestService {
  constructor(
    @Inject(() => TestRepository)
    private testRepository: ITestRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => QuestionRepository)
    private questionRepository: IQuestionRepository,
    @Inject(() => UserTestRepository)
    private userTestRepository: IUserTestRepository,
    @Inject(() => ConfigService)
    private configService: IConfigService,
    @Inject(() => UserCourseRepository)
    private userCourseRepository: IUserCourseRepository,
    @Inject(() => AchievementRepository)
    private achievementRepository: IAchievementRepository,
    @Inject(() => UserAchievementRepository)
    private userAchievementRepository: IUserAchievementRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository,
    @Inject(() => CourseRepository)
    private courseRepository: ICourseRepository,
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository,
    @Inject() private database: Database
  ) {}

  courseAchievementTrigger = async (
    userId: string,
    session: mongoose.ClientSession
  ): Promise<void> => {
    const logger = getLogger("LESSON_COMPLETED");
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new CustomException(StatusCodeEnum.NotFound_404, "User not found");
    }
    const userCourses =
      await this.userCourseRepository.getUserCourseForAchievement(
        userId,
        session
      );

    const achievement = await this.achievementRepository.getClosestAchievement(
      AchievementTypeEnum.CouseCompletion,
      userCourses.length || 0
    );

    if (!achievement) {
      logger.info(
        `No lesson completed achievement found for this number of lesson(s): ${userCourses.length}`
      );
      await this.database.commitTransaction(session);
      return;
    }

    if (userCourses.length < achievement?.goal) {
      logger.info(
        `Closest achievement goal (${achievement.goal}) not yet reached for completed course(s): ${userCourses.length}`
      );
      await this.database.commitTransaction(session);
      return;
    }

    const achievedAchievement =
      await this.userAchievementRepository.findExistingAchievement(
        (achievement._id as ObjectId).toString(),
        userId
      );

    if (achievedAchievement) {
      logger.info(`User ${userId} already has achievement ${achievement._id}`);
      await this.database.commitTransaction(session);
      return;
    }

    // Create new user achievement
    const userAchievement =
      await this.userAchievementRepository.createUserAchievement(
        {
          userId,
          achievementId: achievement._id,
        },
        session
      );

    if (!userAchievement) {
      logger.error(
        `Failed to create user achievement for user: ${userId}, achievement: ${achievement._id}`
      );
      await this.database.commitTransaction(session);
      return;
    }

    logger.info(
      `Awarded achievement ${achievement._id} to user ${userId} for ${userCourses.length} lesson completed`
    );
    await this.database.commitTransaction(session);

    //notify user
    notifyAchievement(achievement, user.email);
  };

  async createTest(
    name: string,
    lessonIds: string[],
    description: string,
    totalQuestions: number
  ): Promise<ITest> {
    const session = await this.database.startTransaction();
    let courseId: string | null = null;
    try {
      // Validate lesson IDs and get courseId
      const firstLesson = await this.lessonRepository.getLessonById(
        lessonIds[0]
      );
      if (!firstLesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Lesson with ID ${lessonIds[0]} not found`
        );
      }
      courseId = firstLesson.courseId.toString();

      // Validate remaining lessons are from same course
      for (let i = 1; i < lessonIds.length; i++) {
        const lesson = await this.lessonRepository.getLessonById(lessonIds[i]);
        if (!lesson) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            `Lesson with ID ${lessonIds[i]} not found`
          );
        }
        if (courseId !== lesson.courseId.toString()) {
          throw new CustomException(
            StatusCodeEnum.Conflict_409,
            "A test's lessonIds must be inside the same course"
          );
        }
      }

      const lessonObjectIds = lessonIds.map((id: any) =>
        typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
      );

      const questions = await this.questionRepository.getQuestionsForTest(
        Number(totalQuestions),
        lessonObjectIds
      );

      if (questions.length < totalQuestions) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Not enough questions for test`
        );
      }

      // Get the next order number for this course
      if (!courseId) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Course ID is required"
        );
      }
      const order = await this.testRepository.getTestOrder(courseId);

      // Create the test with courseId
      const test = await this.testRepository.createTest(
        {
          name,
          description,
          lessonIds: lessonObjectIds,
          totalQuestions,
          courseId: new mongoose.Types.ObjectId(courseId),
          order,
        },
        session
      );

      await this.database.commitTransaction(session);
      return test;
    } catch (error) {
      await this.database.abortTransaction(session);
      throw error;
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

          if (courseId === null) {
            courseId = lesson.courseId.toString();
          } else if (courseId?.toString() !== lesson.courseId.toString()) {
            throw new CustomException(
              StatusCodeEnum.Conflict_409,
              "A test's lessonIds must be inside the same course"
            );
          }
        }
      }

      if (totalQuestions && totalQuestions !== test.totalQuestions) {
        const lessonObjectIds = lessonIds.map((id: any) =>
          typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
        );

        const questions = await this.questionRepository.getQuestionsForTest(
          Number(totalQuestions),
          lessonObjectIds
        );

        if (questions.length < totalQuestions) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            `Not enough questions for test`
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

      const questions = await this.questionRepository.getQuestionsForTest(
        Number(test.totalQuestions),
        lessonObjectIds
      );

      return { ...test, questions } as ITest;
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
    console.log(data);
    const session = await this.database.startTransaction();
    try {
      const test = await this.testRepository.getTestById(data.testId);
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }

      const questions = await this.questionRepository.getQuestionsByLessonIds(
        test.lessonIds.map((id) => id.toString())
      );

      let incorrectDetail = {
        totalQuestion: 0,
        incorrectQuestion: 0,
        incorrectFocus: {
          [ExerciseFocusEnum.VOCABULARY]: 0,
          [ExerciseFocusEnum.GRAMMAR]: 0,
        },
        incorrectType: {
          [ExerciseTypeEnum.MULTIPLE_CHOICE]: 0,
          [ExerciseTypeEnum.TRANSLATE]: 0,
          [ExerciseTypeEnum.IMAGE_TRANSLATE]: 0,
          [ExerciseTypeEnum.FILL_IN_THE_BLANK]: 0,
        },
      };
      const questionIds = questions.map((q: IQuestion) =>
        (q._id as mongoose.Types.ObjectId)?.toString()
      );
      const invalidQuestionIds = data.answers.filter(
        (ans) => questionIds.indexOf(ans.exerciseId) === -1
      );
      if (invalidQuestionIds.length > 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid question IDs in submission"
        );
      }

      function normalize(str: string) {
        return str.replace(/[.,]/g, "").trim().toLowerCase();
      }

      let correctAnswers = 0;
      const results = data.answers.map((answer) => {
        incorrectDetail.totalQuestion++;
        const question = questions.find(
          (q: IQuestion) =>
            (q._id as mongoose.Types.ObjectId)?.toString() ===
            answer.exerciseId?.toString()
        )!;
        let isCorrect: boolean;

        switch (question.type) {
          case ExerciseTypeEnum.MULTIPLE_CHOICE:
            isCorrect =
              answer.selectedAnswers.length === (Array.isArray(question.answer) ? question.answer.length : 1) &&
              answer.selectedAnswers.every((ans) =>
                Array.isArray(question.answer) ? question.answer.indexOf(ans) !== -1 : question.answer === ans
              );
            if (!isCorrect) {
              incorrectDetail.incorrectQuestion++;
              if (question.focus === ExerciseFocusEnum.VOCABULARY) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.VOCABULARY]++;
              } else if (question.focus === ExerciseFocusEnum.GRAMMAR) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.GRAMMAR]++;
              }
              incorrectDetail.incorrectType[ExerciseTypeEnum.MULTIPLE_CHOICE]++;
            }

            break;
          case ExerciseTypeEnum.TRANSLATE:
            isCorrect = answer.selectedAnswers.some(
              (selected) =>
                Array.isArray(question.answer) &&
                question.answer.some(
                  (correct) => normalize(selected) === normalize(correct)
                )
            );
            if (!isCorrect) {
              incorrectDetail.incorrectQuestion++;
              if (question.focus === ExerciseFocusEnum.VOCABULARY) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.VOCABULARY]++;
              } else if (question.focus === ExerciseFocusEnum.GRAMMAR) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.GRAMMAR]++;
              }
              incorrectDetail.incorrectType[ExerciseTypeEnum.TRANSLATE]++;
            }

            break;
          case ExerciseTypeEnum.IMAGE_TRANSLATE:
            isCorrect = answer.selectedAnswers.some(
              (selected) =>
                Array.isArray(question.answer) &&
                question.answer.some(
                  (correct) => normalize(selected) === normalize(correct)
                )
            );
            if (!isCorrect) {
              incorrectDetail.incorrectQuestion++;
              if (question.focus === ExerciseFocusEnum.VOCABULARY) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.VOCABULARY]++;
              } else if (question.focus === ExerciseFocusEnum.GRAMMAR) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.GRAMMAR]++;
              }
              incorrectDetail.incorrectType[ExerciseTypeEnum.IMAGE_TRANSLATE]++;
            }

            break;
          case ExerciseTypeEnum.FILL_IN_THE_BLANK:
            isCorrect = answer.selectedAnswers.some(
              (selected) =>
                Array.isArray(question.answer) &&
                question.answer.some(
                  (correct) => normalize(selected) === normalize(correct)
                )
            );
            if (!isCorrect) {
              incorrectDetail.incorrectQuestion++;
              if (question.focus === ExerciseFocusEnum.VOCABULARY) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.VOCABULARY]++;
              } else if (question.focus === ExerciseFocusEnum.GRAMMAR) {
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.GRAMMAR]++;
              }

              incorrectDetail.incorrectType[
                ExerciseTypeEnum.FILL_IN_THE_BLANK
              ]++;
            }
            break;
          default:
            isCorrect = false;
            incorrectDetail.incorrectType[question.type]++;
        }

        if (isCorrect) correctAnswers++;
        return {
          exerciseId: answer.exerciseId,
          selectedAnswers: answer.selectedAnswers,
          correctAnswers: Array.isArray(question.answer)
            ? question.answer
            : [question.answer],
          isCorrect,
        };
      });

      const score = Math.round((correctAnswers / test.totalQuestions) * 100);

      let passingPoint = 80;
      try {
        const config = await this.configService.getConfig("test_passing_point");
        passingPoint = parseInt(config.value, 10);
      } catch (configError) {
        console.log("Using default passing point:", passingPoint);
      }

      const status =
        score >= passingPoint
          ? UserTestStatusEnum.PASSED
          : UserTestStatusEnum.FAILED;

      const lastAttempt = await this.userTestRepository.getLatestAttempt(
        data.userId,
        data.testId
      );
      const attemptNo = lastAttempt ? lastAttempt.attemptNo + 1 : 1;

      const submission = {
        userId: new mongoose.Types.ObjectId(data.userId),
        testId: new mongoose.Types.ObjectId(data.testId),
        attemptNo,
        score,
        status,
        description:
          status === UserTestStatusEnum.PASSED
            ? `Test passed successfully, this test include ${
                incorrectDetail.totalQuestion
              } questions, ${
                incorrectDetail.incorrectQuestion
              } questions are incorrect, \n About focus: ${
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.VOCABULARY]
              } questions are incorrect in vocabulary, \n ${
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.GRAMMAR]
              } questions are incorrect in grammar, \n About type: ${
                incorrectDetail.incorrectType[ExerciseTypeEnum.MULTIPLE_CHOICE]
              } questions are incorrect in multiple choice, \n ${
                incorrectDetail.incorrectType[ExerciseTypeEnum.TRANSLATE]
              } questions are incorrect in translate, \n ${
                incorrectDetail.incorrectType[ExerciseTypeEnum.IMAGE_TRANSLATE]
              } questions are incorrect in image translate, \n ${
                incorrectDetail.incorrectType[
                  ExerciseTypeEnum.FILL_IN_THE_BLANK
                ]
              } questions are incorrect in fill in the blank`
            : `Test failed, this test include ${
                incorrectDetail.totalQuestion
              } questions, ${
                incorrectDetail.incorrectQuestion
              } questions are incorrect, \n About focus: ${
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.VOCABULARY]
              } questions are incorrect in vocabulary, \n ${
                incorrectDetail.incorrectFocus[ExerciseFocusEnum.GRAMMAR]
              } questions are incorrect in grammar, \n About type: ${
                incorrectDetail.incorrectType[ExerciseTypeEnum.MULTIPLE_CHOICE]
              } questions are incorrect in multiple choice, \n ${
                incorrectDetail.incorrectType[ExerciseTypeEnum.TRANSLATE]
              } questions are incorrect in translate, \n ${
                incorrectDetail.incorrectType[ExerciseTypeEnum.IMAGE_TRANSLATE]
              } questions are incorrect in image translate, \n ${
                incorrectDetail.incorrectType[
                  ExerciseTypeEnum.FILL_IN_THE_BLANK
                ]
              } questions are incorrect in fill in the blank`,
      };

      const savedSubmission = await this.userTestRepository.createUserTest(
        submission,
        session
      );

      if (status === UserTestStatusEnum.PASSED) {
        await this.updateUserCourseStatus(
          data.userId,
          test.courseId.toString(),
          session
        );
        await increaseUserPoint(data.userId, IncreasePointEnum.TEST);
        await this.courseAchievementTrigger(data.userId, session);
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
   */
  private async updateUserCourseStatus(
    userId: string,
    courseId: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      const courseLessons = await this.lessonRepository.getLessonsByCourseIdV2(
        courseId
      );

      const userLessons =
        await this.userLessonRepository.getUserLessonBasedOnLessonIds(
          userId,
          courseLessons,
          session
        );

      const allLessonsCompleted =
        courseLessons.length > 0 &&
        userLessons.length === courseLessons.length &&
        userLessons.every(
          (userLesson) => userLesson.status === UserLessonStatus.COMPLETED
        );

      const courseTests = await this.testRepository.getTestsByCourseId(
        courseId
      );

      const userTests = await this.userTestRepository.getUserTestsByTestIds(
        userId,
        courseTests,
        session
      );

      const passedTestIds = new Set<string>();
      for (const test of userTests as any[]) {
        passedTestIds.add(test.testId.toString());
      }

      const allTestsPassed =
        courseTests.length > 0 && passedTestIds.size === courseTests.length;

      const newStatus =
        allLessonsCompleted && allTestsPassed
          ? UserCourseStatus.COMPLETED
          : UserCourseStatus.ONGOING;

      const userCourse = await UserCourseModel.findOneAndUpdate(
        {
          userId: new mongoose.Types.ObjectId(userId),
          courseId: new mongoose.Types.ObjectId(courseId),
        },
        {
          $set: {
            status: newStatus,
            lessonFinished: userLessons.filter(
              (ul) => ul.status === UserLessonStatus.COMPLETED
            ).length,
          },
        },
        { upsert: true, new: true, session }
      );

      let averageScore: number | undefined;
      if (newStatus === UserCourseStatus.COMPLETED) {
        const course = await this.courseRepository.getCourseById(courseId);
        const level = course?.level;
        await increaseUserPoint(userId, IncreasePointEnum.COURSE, level);
      }
      if (userTests.length > 0) {
        const totalScore = userTests.reduce(
          (sum: number, test: IUserTest) => sum + test.score,
          0
        );
        averageScore = Math.round(totalScore / userTests.length);
      }

      await this.userCourseRepository.completeCourseLogic(
        userId,
        courseId,
        newStatus,
        userLessons,
        averageScore,
        session
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to update user course status"
      );
    }
  }

  getUserTestByTestId = async (
    testId: string,
    requesterId: string
  ): Promise<IUserTest | null> => {
    try {
      const userTest = await this.userTestRepository.getUserTestByTestId(
        testId,
        requesterId
      );

      if (!userTest) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User test not found"
        );
      }

      return userTest;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };
}

export default TestService;
