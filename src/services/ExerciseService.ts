import { Inject, Service } from "typedi";
import { IExerciseService } from "../interfaces/services/IExerciseService";
import ExerciseRepository from "../repositories/ExcerciseRepository";
import QuestionRepository from "../repositories/QuestionRepository";
import mongoose, { ObjectId, Schema } from "mongoose";
import { IExercise } from "../interfaces/models/IExercise";
import { IQuestion } from "../interfaces/models/IQuestion";
import { IPagination } from "../interfaces/others/IPagination";
import { IQuery } from "../interfaces/others/IQuery";
import Database from "../db/database";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import LessonRepository from "../repositories/LessonRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import { IQuestionRepository } from "../interfaces/repositories/IQuestionRepository";
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
    @Inject(() => QuestionRepository)
    private questionRepository: IQuestionRepository,
    @Inject(() => TestRepository)
    private testRepository: ITestRepository,
    @Inject(() => UserExerciseRepository)
    private userExerciseRepository: IUserExerciseRepository,
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository,
    @Inject() private database: Database
  ) {}

  /**
   * Create an exercise with questions
   */
  createExercise = async (
    lessonId: string,
    questions: Array<{
      type: string;
      question: string;
      answer: string | string[];
      focus: string;
      options?: string[];
      explanation?: string;
      image?: string;
    }>
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
      const questionIds: mongoose.Types.ObjectId[] = [];

      // Create questions first
      for (const questionData of questions) {
        const questionOrder = await this.questionRepository.getQuestionOrder(lessonId);
        const question = await this.questionRepository.createQuestion(
          {
            lessonId: new mongoose.Types.ObjectId(lessonId),
            type: questionData.type,
            question: questionData.question,
            answer: Array.isArray(questionData.answer) ? questionData.answer : [questionData.answer],
            focus: questionData.focus,
            options: questionData.options,
            explanation: questionData.explanation,
            image: questionData.image,
            order: questionOrder,
          },
          session
        );
        if (question) {
          questionIds.push(question._id as mongoose.Types.ObjectId);
        }
      }

      // Create exercise with question references
      const exercise = await this.exerciseRepository.createExercise(
        {
          lessonId: new mongoose.Types.ObjectId(lessonId),
          questionIds,
          order,
        },
        session
      );

      // Update lesson length
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

      // Clean up any uploaded images
      for (const questionData of questions) {
        if (questionData.image) {
          await cleanUpFile(questionData.image, "create");
        }
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

  /**
   * Update an exercise and its questions
   */
  updateExercise = async (
    id: string,
    questions: Array<{
      id?: string; // If provided, update existing question
      type: string;
      question: string;
      answer: string | string[];
      focus: string;
      options?: string[];
      explanation?: string;
      image?: string;
    }>
  ): Promise<IExercise | null> => {
    const session = await this.database.startTransaction();
    try {
      const exercise = await this.exerciseRepository.getExercise(id);
      if (!exercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      const questionIds: mongoose.Types.ObjectId[] = [];

      // Update or create questions
      for (const questionData of questions) {
        if (questionData.id) {
          // Update existing question
          const updatedQuestion = await this.questionRepository.updateQuestion(
            questionData.id,
            {
              question: questionData.question,
              answer: Array.isArray(questionData.answer) ? questionData.answer : [questionData.answer],
              focus: questionData.focus,
              options: questionData.options,
              explanation: questionData.explanation,
              image: questionData.image,
            }
          );
          if (updatedQuestion) {
            questionIds.push(updatedQuestion._id as mongoose.Types.ObjectId);
          }
        } else {
          // Create new question
          const lessonId = exercise.lessonId.toString();
          const questionOrder = await this.questionRepository.getQuestionOrder(lessonId);
          const newQuestion = await this.questionRepository.createQuestion(
            {
              lessonId: new mongoose.Types.ObjectId(lessonId),
              type: questionData.type,
              question: questionData.question,
              answer: Array.isArray(questionData.answer) ? questionData.answer : [questionData.answer],
              focus: questionData.focus,
              options: questionData.options,
              explanation: questionData.explanation,
              image: questionData.image,
              order: questionOrder,
            },
            session
          );
          if (newQuestion) {
            questionIds.push(newQuestion._id as mongoose.Types.ObjectId);
          }
        }
      }

      // Update exercise with new question references
      const updatedExercise = await this.exerciseRepository.updateExercise(
        id,
        { questionIds },
        session
      );

      await this.database.commitTransaction(session);
      return updatedExercise;
    } catch (error) {
      await session.abortTransaction(session);

      // Clean up any uploaded images
      for (const questionData of questions) {
        if (questionData.image) {
          await cleanUpFile(questionData.image, "create");
        }
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

  /**
   * Delete an exercise and its associated questions
   */
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

      // Delete associated questions
      for (const questionId of exercise.questionIds) {
        await this.questionRepository.deleteQuestion(
          questionId.toString(),
          session
        );
      }

      // Delete the exercise
      const deletedExercise = await this.exerciseRepository.deleteExercise(
        id,
        session
      );

      // Update lesson length
      const lessonId = exercise.lessonId.toString();
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (lesson) {
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
      }

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

  /**
   * Get exercises with populated questions
   */
  getExercises = async (
    query: IQuery,
    lessonId: string
  ): Promise<IPagination> => {
    try {
      const exercises = await this.exerciseRepository.getExercises(
        query,
        lessonId
      );

      // Populate questions for each exercise
      const exercisesWithQuestions = await Promise.all(
        exercises.data.map(async (exercise: IExercise) => {
          const questions = await Promise.all(
            exercise.questionIds.map(async (questionId) => {
              return await this.questionRepository.getQuestion(questionId.toString());
            })
          );
          return {
            ...exercise.toObject(),
            questions: questions.filter(q => q !== null),
          };
        })
      );

      return {
        ...exercises,
        data: exercisesWithQuestions,
      };
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

  /**
   * Get a single exercise with populated questions
   */
  getExercise = async (id: string): Promise<IExercise | null> => {
    try {
      const exercise = await this.exerciseRepository.getExercise(id);
      if (!exercise) {
        return null;
      }

      // Populate questions
      const questions = await Promise.all(
        exercise.questionIds.map(async (questionId) => {
          return await this.questionRepository.getQuestion(questionId.toString());
        })
      );

      return {
        ...exercise.toObject(),
        questions: questions.filter(q => q !== null),
      } as IExercise;
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

  /**
   * Submit exercises with questions
   */
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

      // Get all exercises for the lesson
      const exercises = await this.exerciseRepository.getExercisesByLessonIds([data.lessonId]);
      
      // Get all questions for these exercises
      const allQuestions: IQuestion[] = [];
      for (const exercise of exercises) {
        const questions = await Promise.all(
          exercise.questionIds.map(async (questionId) => {
            return await this.questionRepository.getQuestion(questionId.toString());
          })
        );
        allQuestions.push(...questions.filter(q => q !== null) as IQuestion[]);
      }

      // Validate all question IDs exist
      const questionIds = allQuestions.map(q => q._id?.toString());
      const invalidQuestionIds = data.answers.filter(
        (ans) => questionIds.indexOf(ans.exerciseId) === -1
      );
      if (invalidQuestionIds.length > 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid question IDs in submission"
        );
      }

      // Process each question submission
      const results = data.answers.map((answer) => {
        const question = allQuestions.find(
          (q) => q._id?.toString() === answer.exerciseId
        )!;
        let isCorrect = false;

        // Grade based on question type
        switch (question.type) {
          case ExerciseTypeEnum.MULTIPLE_CHOICE:
            isCorrect =
              answer.selectedAnswers.length === 1 &&
              question.answer.length === 1 &&
              answer.selectedAnswers[0] === question.answer[0];
            break;
          case ExerciseTypeEnum.TRANSLATE:
          case ExerciseTypeEnum.IMAGE_TRANSLATE:
            isCorrect =
              answer.selectedAnswers.length === 1 &&
              question.answer.length >= 1 &&
              Array.isArray(question.answer) &&
              question.answer.some(
                (correctAns: string) =>
                  correctAns.toLowerCase().trim() ===
                  answer.selectedAnswers[0].toLowerCase().trim()
              );
            break;
          case ExerciseTypeEnum.FILL_IN_THE_BLANK:
            isCorrect =
              answer.selectedAnswers.length === question.answer.length &&
              answer.selectedAnswers.every(
                (ans, idx) =>
                  ans.trim() === (question.answer as string[])[idx].trim()
              );
            break;
          default:
            isCorrect = false;
        }

        return {
          exerciseId: answer.exerciseId,
          selectedAnswers: answer.selectedAnswers,
          correctAnswers: Array.isArray(question.answer)
            ? question.answer
            : [question.answer as string],
          isCorrect,
        };
      });

      // Mark all exercises in the lesson as completed
      await this.userExerciseRepository.markAllExercisesInLessonAsCompleted(
        data.userId,
        data.lessonId,
        exercises.map((ex) => ex._id as mongoose.Types.ObjectId),
        session
      );

      // Mark lesson as completed
      await this.userLessonRepository.markLessonAsCompleted(
        data.userId,
        data.lessonId,
        allQuestions.length,
        session
      );

      // Increase user points for completing the lesson
      try {
        await increaseUserPoint(data.userId, "lesson");
      } catch (error) {
        console.error("Failed to increase user points:", error);
      }

      await this.database.commitTransaction(session);

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
