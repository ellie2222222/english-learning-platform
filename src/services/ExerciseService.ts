import { Inject, Service } from "typedi";
import { IExerciseService } from "../interfaces/services/IExerciseService";
import ExerciseRepository from "../repositories/ExcerciseRepository";
import mongoose, { ObjectId, Schema } from "mongoose";
import { IExercise } from "../interfaces/models/IExercise";
import { IPagination } from "../interfaces/others/IPagination";
import { IQuery } from "../interfaces/others/IQuery";
import Database from "../db/database";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import LessonRepository from "../repositories/LessonRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import { cleanUpFile } from "../utils/fileUtils";
import TestRepository from "../repositories/TestRepository";
import { IExerciseRepository } from "../interfaces/repositories/IExerciseRepository";
import { ITestRepository } from "../interfaces/repositories/ITestRepository";
import {
  ISubmitExercises,
  IUserExerciseResponse,
} from "../interfaces/others/ISubmission";
import UserExerciseRepository from "../repositories/UserExerciseRepository";
import { IUserExerciseRepository } from "../interfaces/repositories/IUserExerciseRepository";
import UserLessonRepository from "../repositories/UserLessonRepository";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";
import { UserLessonStatus } from "../enums/UserLessonStatus";
import UserExerciseModel from "../models/UserExerciseModel";
import UserLessonModel from "../models/UserLessonModel";
import increaseUserPoint from "../utils/userPoint";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

@Service()
class ExerciseService implements IExerciseService {
  constructor(
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => ExerciseRepository)
    private exerciseRepository: IExerciseRepository,
    @Inject(() => TestRepository)
    private testRepository: ITestRepository,
    @Inject(() => UserExerciseRepository)
    private userExerciseRepository: IUserExerciseRepository,
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository,
    @Inject() private database: Database
  ) {}

  private arraysEqual(
    a: string | string[] | undefined,
    b: string | string[] | undefined
  ): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a === "string" && typeof b === "string") return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((val, index) => val === b[index]);
    }
    return false;
  }

  createExercise = async (
    lessonId: string,
    type: string,
    question: string,
    answer: string | string[],
    focus: string,
    options?: string[],
    explanation?: string,
    image?: string
  ): Promise<IExercise | null> => {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const order = await this.exerciseRepository.getExerciseOrder(lessonId);

      const exercise = await this.exerciseRepository.createExercise(
        {
          lessonId: new mongoose.Types.ObjectId(lessonId),
          type,
          question,
          answer,
          focus,
          options,
          explanation,
          image,
          order,
        },
        session
      );

      //update lesson length
      const updatedLength = [...lesson.length];
      const idx = updatedLength.findIndex(
        (item) => item.for === LessonTrackingType.EXERCISE
      );
      if (idx !== -1) {
        updatedLength[idx].amount += 1;
      } else {
        updatedLength.push({ for: LessonTrackingType.EXERCISE, amount: 1 });
      }
      await this.lessonRepository.updateLesson(
        lessonId,
        { length: updatedLength },
        session
      );

      await this.database.commitTransaction(session);

      return exercise;
    } catch (error) {
      await session.abortTransaction(session);

      if (image) {
        await cleanUpFile(image, "create");
      }
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };
  updateExercise = async (
    id: string,
    question: string,
    answer: string | string[],
    focus: string,
    options?: string[],
    explanation?: string,
    image?: string
  ): Promise<IExercise | null> => {
    const session = await this.database.startTransaction();
    try {
      // Exercise existence
      const checkExercise = await this.exerciseRepository.getExercise(id);
      let cleanUpImage = false;
      if (!checkExercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      // Lesson existence
      const checkLesson = await this.lessonRepository.getLessonById(
        (checkExercise.lessonId as ObjectId).toString()
      );

      if (!checkLesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found or have been deleted"
        );
      }

      // Validate answer based on exercise type
      if (answer !== undefined || options !== undefined) {
        const checkOptions = options ?? checkExercise.options;
        const checkAnswer = answer ?? checkExercise.answer;

        if (checkExercise.type === ExerciseTypeEnum.MULTIPLE_CHOICE) {
          // Ensure checkAnswer is an array with one string and exists in checkOptions
          if (
            !Array.isArray(checkAnswer) ||
            checkAnswer.length !== 1 ||
            typeof checkAnswer[0] !== "string" ||
            (checkOptions && !checkOptions.includes(checkAnswer[0]))
          ) {
            throw new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Answer must be an array with one valid option for multiple choice"
            );
          }

          // Validate options if provided
          if (options) {
            if (
              !Array.isArray(options) ||
              options.length === 0 ||
              options.some((opt) => typeof opt !== "string" || !opt)
            ) {
              throw new CustomException(
                StatusCodeEnum.BadRequest_400,
                "Options must be a non-empty array of strings"
              );
            }
          }
        } else if (
          [
            ExerciseTypeEnum.IMAGE_TRANSLATE,
            ExerciseTypeEnum.FILL_IN_THE_BLANK,
            ExerciseTypeEnum.TRANSLATE,
          ].includes(checkExercise.type)
        ) {
          if (
            !Array.isArray(checkAnswer) ||
            checkAnswer.length === 0 ||
            checkAnswer.some((ans) => typeof ans !== "string" || !ans)
          ) {
            throw new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Answer must be a non-empty array of strings"
            );
          }
        }
      }

      const data: Partial<IExercise> = {};
      if (question && question !== checkExercise.question)
        data.question = question;
      if (
        answer !== undefined &&
        !this.arraysEqual(answer, checkExercise.answer)
      ) {
        // Normalize answer to array for multiple-choice if it's a string
        data.answer =
          checkExercise.type === ExerciseTypeEnum.MULTIPLE_CHOICE &&
          typeof answer === "string"
            ? [answer]
            : answer;
      }
      if (focus && focus !== checkExercise.focus) data.focus = focus;
      if (
        options &&
        checkExercise.type === ExerciseTypeEnum.MULTIPLE_CHOICE &&
        !this.arraysEqual(options, checkExercise.options)
      ) {
        data.options = options;
      }
      if (explanation && explanation !== checkExercise.explanation) {
        data.explanation = explanation;
      }
      if (
        image &&
        checkExercise.type === ExerciseTypeEnum.IMAGE_TRANSLATE &&
        image !== checkExercise.image
      ) {
        if (checkExercise.image) {
          data.image = image;
          cleanUpImage = true; // Flag for cleanup
        } else {
          data.image = image;
        }
      }

      const exercise = await this.exerciseRepository.updateExercise(
        id,
        data,
        session
      );

      await this.database.commitTransaction(session);

      if (cleanUpImage) {
        await cleanUpFile(checkExercise.image as string, "update");
      }

      return exercise;
    } catch (error) {
      await session.abortTransaction(session);

      if (image) {
        cleanUpFile(image, "create");
      }
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  async deleteExercise(id: string): Promise<IExercise | null> {
    const session = await this.database.startTransaction();
    try {
      const exercise = await this.exerciseRepository.getExercise(id);
      if (!exercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      // Get the lesson ID and count of exercises in the lesson
      const lessonId = exercise.lessonId.toString();

      // Find tests that include the exercise's lesson
      const tests = await this.testRepository.getTestsByLessonIdV2(lessonId);

      let canDelete = true;
      for (const test of tests) {
        const remainingLessonIds = test.lessonIds.filter(
          (lid) => lid?.toString() !== exercise.lessonId?.toString()
        );
        const totalExercisesAcrossLessons =
          await this.exerciseRepository.countExercisesByLessonIds(
            test.lessonIds.map((lid) => lid.toString())
          );
        const deletedExercisesAcrossLessons =
          await this.exerciseRepository.countDeletedExercisesByLessonIds(
            test.lessonIds.map((lid) => lid.toString())
          );
        const remainingExercisesAcrossLessons =
          totalExercisesAcrossLessons - deletedExercisesAcrossLessons;

        if (
          remainingExercisesAcrossLessons === test.totalQuestions &&
          remainingLessonIds.length > 0
        ) {
          // Do not delete if remaining exercises match totalQuestions and other lessons exist
          canDelete = true; // Still allowed, just update test
        } else if (
          remainingExercisesAcrossLessons < test.totalQuestions ||
          remainingLessonIds.length === 0
        ) {
          // Cannot delete if it would reduce exercises below totalQuestions or leave no lessons
          canDelete = false;
          break;
        }
      }

      if (!canDelete) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Cannot delete exercise as it would invalidate test constraints"
        );
      }

      // Delete the exercise
      const deletedExercise = await this.exerciseRepository.deleteExercise(
        id,
        session
      );

      // Update or delete tests after successful deletion
      for (const test of tests) {
        const remainingLessonIds = test.lessonIds.filter(
          (lid) => lid?.toString() !== exercise.lessonId?.toString()
        );
        if (remainingLessonIds.length === 0) {
          await this.testRepository.deleteTest(
            (test._id as string).toString(),
            session
          );
        } else {
          await this.testRepository.updateTest(
            (test._id as string).toString(),
            { lessonIds: remainingLessonIds },
            session
          );
        }
      }

      //update lesson length
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const updatedLength = [...lesson.length];
      const idx = updatedLength.findIndex(
        (item) => item.for === LessonTrackingType.EXERCISE
      );
      if (idx !== -1) {
        updatedLength[idx].amount =
          updatedLength[idx].amount - 1 < 0 ? 0 : updatedLength[idx].amount - 1;
      }
      await this.lessonRepository.updateLesson(
        lessonId,
        { length: updatedLength },
        session
      );

      await this.database.commitTransaction(session);
      return deletedExercise;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  getExercises = async (
    query: IQuery,
    lessonId: string
  ): Promise<IPagination> => {
    try {
      const exercises = await this.exerciseRepository.getExercises(
        query,
        lessonId
      );

      return exercises;
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

  getExercise = async (id: string): Promise<IExercise | null> => {
    try {
      const exercise = await this.exerciseRepository.getExercise(id);
      return exercise;
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

  submitExercises = async (
    data: ISubmitExercises
  ): Promise<IUserExerciseResponse> => {
    const session = await this.database.startTransaction();
    try {
      // Validate lesson exists
      const lesson = await this.lessonRepository.getLessonById(data.lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      // Validate all exercise IDs exist and belong to the specified lesson
      const exerciseIds = data.answers.map((answer) => answer.exerciseId);
      const exercises = await Promise.all(
        exerciseIds.map((id) => this.exerciseRepository.getExercise(id))
      );

      // Check if any exercises were not found
      const missingExercises = exercises.findIndex((ex) => !ex);
      if (missingExercises !== -1) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Exercise with ID ${exerciseIds[missingExercises]} not found`
        );
      }

      // Validate all exercises belong to the specified lesson
      const invalidExercises = exercises.filter(
        (exercise) => exercise?.lessonId.toString() !== data.lessonId
      );

      if (invalidExercises.length > 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          `Some exercises do not belong to the specified lesson`
        );
      }

      // Process each exercise submission - evaluate correctness but will mark all as completed
      const results = data.answers.map((answer, index) => {
        const exercise = exercises[index] as IExercise;
        let isCorrect = false;

        // Grade based on exercise type
        switch (exercise.type) {
          case ExerciseTypeEnum.MULTIPLE_CHOICE:
            // Exact match for multiple-choice answers
            isCorrect =
              answer.selectedAnswers.length === 1 &&
              exercise.answer.length === 1 &&
              answer.selectedAnswers[0] === exercise.answer[0];
            break;
          case ExerciseTypeEnum.TRANSLATE:
          case ExerciseTypeEnum.IMAGE_TRANSLATE:
            // Case-insensitive match for translation answers
            isCorrect =
              answer.selectedAnswers.length === 1 &&
              exercise.answer.length >= 1 &&
              Array.isArray(exercise.answer) &&
              exercise.answer.some(
                (correctAns: string) =>
                  correctAns.toLowerCase().trim() ===
                  answer.selectedAnswers[0].toLowerCase().trim()
              );
            break;
          case ExerciseTypeEnum.FILL_IN_THE_BLANK:
            // Exact match for fill-in-the-blank answers
            isCorrect =
              answer.selectedAnswers.length === exercise.answer.length &&
              answer.selectedAnswers.every(
                (ans, idx) =>
                  ans.trim() === (exercise.answer as string[])[idx].trim()
              );
            break;
          default:
            isCorrect = false;
        }

        return {
          exerciseId: answer.exerciseId,
          selectedAnswers: answer.selectedAnswers,
          correctAnswers: Array.isArray(exercise.answer)
            ? exercise.answer
            : [exercise.answer as string],
          isCorrect, // Return actual correctness
        };
      });

      // Get total exercises for this lesson
      const totalExercises = await this.exerciseRepository.getAllLessonExercise(
        data.lessonId
      );
      const totalExerciseCount = totalExercises.length;

      // Mark all exercises in the lesson as completed regardless of correctness
      await this.userExerciseRepository.markAllExercisesInLessonAsCompleted(
        data.userId,
        data.lessonId,
        totalExercises.map((ex) => ex._id as mongoose.Types.ObjectId),
        session
      );

      // Mark lesson as completed
      await this.userLessonRepository.markLessonAsCompleted(
        data.userId,
        data.lessonId,
        totalExerciseCount,
        session
      );

      // Increase user points for completing the lesson
      try {
        await increaseUserPoint(data.userId, "lesson");
      } catch (error) {
        console.error("Failed to increase user points:", error);
        // Continue execution even if points couldn't be increased
      }

      await this.database.commitTransaction(session);

      // Return the submission response with actual correctness
      return {
        userId: data.userId,
        submittedAt: new Date(),
        results,
      };
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to submit exercises"
      );
    } finally {
      await session.endSession();
    }
  };
}

export default ExerciseService;
