import { Inject, Service } from "typedi";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IUserExercise } from "../interfaces/models/IUserExercise";
import { IPagination } from "../interfaces/others/IPagination";
import { IUserExerciseService } from "../interfaces/services/IUserExerciseService";
import Database from "../db/database";
import ExerciseRepository from "../repositories/ExcerciseRepository";
import { IExerciseRepository } from "../interfaces/repositories/IExerciseRepository";
import UserExerciseRepository from "../repositories/UserExerciseRepository";
import { IUserExerciseRepository } from "../interfaces/repositories/IUserExerciseRepository";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/others/IQuery";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import mongoose, { ObjectId } from "mongoose";
import { IExercise } from "../interfaces/models/IExercise";
import UserLessonRepository from "../repositories/UserLessonRepository";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

@Service()
class UserExerciseService implements IUserExerciseService {
  constructor(
    @Inject() private database: Database,
    @Inject(() => UserRepository) private userRepository: IUserRepository,
    @Inject(() => ExerciseRepository)
    private exerciseRepository: IExerciseRepository,
    @Inject(() => UserExerciseRepository)
    private userExerciseRepository: IUserExerciseRepository,
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository
  ) {}

  private normalizeString = (str: string): string => {
    return str.trim().replace(/\s+/g, " ").replace(/[,.]/g, "").toLowerCase();
  };

  private handlingUserExerciseCompletion = async (
    exercise: IExercise,
    userId: string,
    answer: string,
    session: mongoose.ClientSession
  ) => {
    type updateData = {
      exerciseId?: mongoose.Types.ObjectId;
      userId?: mongoose.Types.ObjectId;
      completed?: boolean;
    };
    let isCorrect = false;
    const normalizedAnswer = this.normalizeString(answer);
    const normalizedCorrectAnswers = (exercise.answer as string[]).map((a) =>
      this.normalizeString(a)
    );

    const existingUserExercise =
      await this.userExerciseRepository.getUserExerciseByExerciseId(
        userId,
        (exercise._id as ObjectId).toString()
      );

    if (existingUserExercise && existingUserExercise.completed) {
      return {
        userExercise: existingUserExercise,
        message: `${
          normalizedCorrectAnswers.includes(normalizedAnswer)
            ? "Correct answer"
            : "Incorrect answer"
        }`,
      };
    }

    const data: updateData = {
      exerciseId: new mongoose.Types.ObjectId(
        (exercise._id as ObjectId).toString()
      ),
      userId: new mongoose.Types.ObjectId(userId),
      completed: false,
    };

    switch (exercise.type) {
      case ExerciseTypeEnum.MULTIPLE_CHOICE:
      case ExerciseTypeEnum.FILL_IN_THE_BLANK:
      case ExerciseTypeEnum.TRANSLATE:
      case ExerciseTypeEnum.IMAGE_TRANSLATE:
        isCorrect = normalizedCorrectAnswers.includes(normalizedAnswer);
        data.completed = normalizedCorrectAnswers.includes(normalizedAnswer);
        break;

      default:
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "Invalid exercise type"
        );
    }

    const savedExercise = existingUserExercise
      ? await this.userExerciseRepository.updateUserExercise(
          (existingUserExercise._id as ObjectId).toString(),
          data,
          session
        )
      : await this.userExerciseRepository.createUserExercise(data, session);

    return {
      userExercise: savedExercise,
      message: `${isCorrect ? "Correct answer" : "Incorrect answer"}`,
    };
  };

  private handlingUserLessonCurrentOrder = async (
    userId: string,
    lessonId: string,
    order: number,
    session: mongoose.ClientSession
  ) => {
    const userLesson = await this.userLessonRepository.getExistingUserLesson(
      userId,
      lessonId
    );
    if (!userLesson) {
      await this.userLessonRepository.createUserLesson(
        {
          userId: new mongoose.Types.ObjectId(userId),
          lessonId: new mongoose.Types.ObjectId(lessonId),
          currentOrder: {
            for: LessonTrackingType.EXERCISE,
            order,
          },
        },
        session
      );

      return;
    }

    const currentOrderArr = [...(userLesson.currentOrder || [])];
    const idx = currentOrderArr.findIndex(
      (item) => item.for === LessonTrackingType.EXERCISE
    );
    if (idx !== -1) {
      if (currentOrderArr[idx].order < order) {
        currentOrderArr[idx].order = order;
      }
    } else {
      currentOrderArr.push({ for: LessonTrackingType.EXERCISE, order });
    }
    await this.userLessonRepository.updateUserLesson(
      (userLesson._id as ObjectId).toString(),
      { currentOrder: currentOrderArr },
      session
    );

    return;
  };

  getUserExercise = async (
    id: string,
    requesterId: string
  ): Promise<IUserExercise | null> => {
    try {
      const userExercise = await this.userExerciseRepository.getUserExercise(
        id
      );

      const checkUser = await this.userRepository.getUserById(requesterId);
      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (
        userExercise?.userId.toString() !== requesterId &&
        checkUser.role !== UserEnum.ADMIN
      ) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }

      return userExercise ?? null;
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

  getUserExercises = async (
    query: IQuery,
    userId: string,
    requesterId: string
  ): Promise<IPagination | null> => {
    try {
      const checkUser = await this.userRepository.getUserById(requesterId);
      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (userId !== requesterId && checkUser.role !== UserEnum.ADMIN) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }

      const userExercises = await this.userExerciseRepository.getUserExercises(
        userId,
        query
      );

      return userExercises;
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

  submitExercise = async (
    exerciseId: string,
    userId: string,
    answer: string
  ): Promise<{ userExercise: IUserExercise | null; message: string }> => {
    const session = await this.database.startTransaction();
    try {
      // Validate exercise existence
      const exercise = await this.exerciseRepository.getExercise(exerciseId);

      if (!exercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      const userExercise = await this.handlingUserExerciseCompletion(
        exercise,
        userId,
        answer,
        session
      );

      //track userLessonProgress
      await this.handlingUserLessonCurrentOrder(
        userId,
        exercise.lessonId.toString(),
        Number(exercise.order),
        session
      );

      await this.database.commitTransaction(session);
      return userExercise;
    } catch (error) {
      await this.database.abortTransaction(session);
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

  getUserExerciseByExerciseId = async (
    exerciseId: string,
    requesterId: string
  ): Promise<IUserExercise | null> => {
    try {
      const userExercise =
        await this.userExerciseRepository.getUserExerciseByExerciseId(
          requesterId,
          exerciseId
        );
      if (!userExercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User exercise not found"
        );
      }
      return userExercise;
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

export default UserExerciseService;
