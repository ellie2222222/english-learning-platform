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

      let formatedAnswer = answer;
      if (
        typeof answer === "string" &&
        (type === ExerciseTypeEnum.TRANSLATE ||
          type === ExerciseTypeEnum.IMAGE_TRANSLATE ||
          type === ExerciseTypeEnum.FILL_IN_THE_BLANK)
      ) {
        formatedAnswer = (answer as string).trim().split(/\s+/);
      }

      const exercise = await this.exerciseRepository.createExercise(
        {
          lessonId: new mongoose.Types.ObjectId(lessonId),
          type,
          question,
          answer: formatedAnswer,
          focus,
          options,
          explanation,
          image,
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
      const checkExercise = await this.exerciseRepository.getExercise(id);
      let cleanUpImage = false;
      if (!checkExercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      const checkLesson = await this.lessonRepository.getLessonById(
        (checkExercise.lessonId as ObjectId).toString()
      );

      if (!checkLesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found or have been deleted"
        );
      }

      const data: Partial<IExercise> = {};
      if (question && question !== checkExercise.question)
        data.question = question;

      if (answer && answer !== checkExercise.answer) {
        let formatedAnswer = answer;
        if (
          typeof answer === "string" &&
          (checkExercise.type === ExerciseTypeEnum.TRANSLATE ||
            checkExercise.type === ExerciseTypeEnum.IMAGE_TRANSLATE ||
            checkExercise.type === ExerciseTypeEnum.FILL_IN_THE_BLANK)
        ) {
          formatedAnswer = (answer as string).trim().split(/\s+/);
        }
        data.answer = formatedAnswer;
      }

      if (focus && focus !== checkExercise.focus) {
        data.focus = focus;
      }

      if (
        checkExercise.type === ExerciseTypeEnum.MULTIPLE_CHOICE &&
        options &&
        options.length &&
        JSON.stringify(options) !== JSON.stringify(checkExercise.options)
      ) {
        data.options = options;
      }

      if (explanation && explanation !== checkExercise.explanation) {
        data.explanation = explanation;
      }

      console.log(image);
      if (
        image &&
        checkExercise.type === ExerciseTypeEnum.IMAGE_TRANSLATE &&
        image !== checkExercise.image
      ) {
        if (checkExercise.image) {
          cleanUpImage = true;
        }
        data.image = image;
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
