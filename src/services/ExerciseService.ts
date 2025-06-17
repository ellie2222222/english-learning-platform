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

@Service()
class ExerciseService implements IExerciseService {
  constructor(
    @Inject(() => LessonRepository) private lessonRepository: ILessonRepository,
    @Inject(() => ExerciseRepository)
    private exerciseRepository: ExerciseRepository,
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

  deleteExercise = async (id: string): Promise<IExercise | null> => {
    const session = await this.database.startTransaction();
    try {
      const exercise = await this.exerciseRepository.deleteExercise(
        id,
        session
      );

      await this.database.commitTransaction(session);

      return exercise;
    } catch (error) {
      await session.abortTransaction(session);
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
}

export default ExerciseService;
