import mongoose, { ClientSession, Types } from "mongoose";
import { IExercise } from "../interfaces/models/IExercise";
import { IExerciseRepository } from "../interfaces/repositories/IExerciseRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import ExerciseModel from "../models/ExerciseModel";
import { IPagination } from "../interfaces/others/IPagination";
import { Service } from "typedi";

@Service()
class ExerciseRepository implements IExerciseRepository {
  async createExercise(
    data: object,
    session?: ClientSession
  ): Promise<IExercise | null> {
    try {
      const exercise = await ExerciseModel.create([data], { session });
      return exercise[0];
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async updateExercise(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IExercise | null> {
    try {
      const exercise = await ExerciseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { $set: data },
        {
          session,
          new: true,
        }
      );

      if (!exercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

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
  }

  async deleteExercise(
    id: string,
    session?: ClientSession
  ): Promise<IExercise | null> {
    try {
      const exercise = await ExerciseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        {
          $set: { isDeleted: true },
        },
        {
          session,
          new: true,
        }
      );

      if (!exercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

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
  }

  async getExercise(id: string): Promise<IExercise | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const exercise = await ExerciseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonId",
            foreignField: "_id",
            as: "lesson",
          },
        },
        { $unwind: "$lesson" },
      ]);

      if (!exercise[0]) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      return exercise[0];
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getExercises(query: IQuery, lessonId?: string): Promise<IPagination> {
    type searchQuery = {
      isDeleted: boolean;
      question?: { $regex: string; $options: string };
      lessonId?: mongoose.Types.ObjectId;
    };

    try {
      const matchQuery: searchQuery = {
        isDeleted: false,
      };

      if (query.search) {
        matchQuery.question = { $regex: query.search, $options: "i" };
      }

      if (lessonId) {
        matchQuery.lessonId = new mongoose.Types.ObjectId(lessonId);
      }

      let sortField = "createdAt";
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;
        case SortByType.NAME:
          sortField = "question";
          break;
        default:
          break;
      }
      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      const skip = (query.page - 1) * query.size;

      const exercises = await ExerciseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonId",
            foreignField: "_id",
            as: "lesson",
          },
        },
        {
          $unwind: "$lesson",
        },
        {
          $sort: { order: 1, [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const totalCount = await ExerciseModel.countDocuments(matchQuery);

      return {
        data: exercises,
        total: totalCount,
        page: query.page,
        totalPages: Math.ceil(totalCount / query.size),
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
  }

  async getExercisesByLessonIds(
    lessonIds: mongoose.Types.ObjectId[] | string[]
  ): Promise<IExercise[]> {
    try {
      const matchQuery = {
        lessonId: { $in: lessonIds },
        isDeleted: false,
      };

      const exercises = await ExerciseModel.find(matchQuery);

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
  }

  async getExercisesForTest(
    length: number,
    lessonIds: Types.ObjectId[]
  ): Promise<IExercise[]> {
    try {
      const matchQuery = {
        lessonId: { $in: lessonIds },
        isDeleted: false,
      };

      const exercises = await ExerciseModel.aggregate([
        {
          $lookup: {
            from: "lessons",
            localField: "lessonId",
            foreignField: "_id",
            as: "lesson",
          },
        },
        {
          $unwind: "$lesson",
        },
        { $match: matchQuery },
        { $sample: { size: length } },
        { $project: { answer: 0, explanation: 0 } },
      ]);

      if (exercises.length < length) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "This test does not have enough exercise for you to participate, please report this issue to admin"
        );
      }

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
  }

  async getExerciseOrder(lessonId: string): Promise<number> {
    try {
      const exerciseOrder = await ExerciseModel.find({
        lessonId: new mongoose.Types.ObjectId(lessonId),
        isDeleted: false,
      }).sort({ order: -1 });

      if (!exerciseOrder[0]) {
        return 1;
      }

      return exerciseOrder[0].order.valueOf() + 1;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getAllLessonExercise(lessonId: string): Promise<IExercise[]> {
    try {
      const exercises = await ExerciseModel.find({
        lessonId: new mongoose.Types.ObjectId(lessonId),
        isDeleted: false,
      });

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
  }

  async deleteExercisesByLessonId(
    lessonId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      const exercises = await ExerciseModel.updateMany(
        {
          lessonId: new mongoose.Types.ObjectId(lessonId),
          isDeleted: false,
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      return exercises.acknowledged;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async deleteExercisesByLessonIds(
    lessonIds: mongoose.Types.ObjectId[],
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      const exercises = await ExerciseModel.updateMany(
        {
          lessonId: { $in: lessonIds },
          isDeleted: false,
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );
      return exercises.acknowledged;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async countExercisesByLessonIds(
    lessonIds: mongoose.Types.ObjectId[]
  ): Promise<number> {
    try {
      const count = await ExerciseModel.countDocuments({
        lessonId: { $in: lessonIds },
        isDeleted: false,
      });

      return count;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async countDeletedExercisesByLessonIds(
    lessonIds: mongoose.Types.ObjectId[]
  ): Promise<number> {
    try {
      const count = await ExerciseModel.countDocuments({
        lessonId: { $in: lessonIds },
        isDeleted: true,
      });

      return count;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getLessonIdByExerciseId(id: string): Promise<string | null> {
    try {
      const exercise = await ExerciseModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
      }).select("lessonId");

      if (!exercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      return exercise.lessonId.toString();
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }
}

export default ExerciseRepository;
