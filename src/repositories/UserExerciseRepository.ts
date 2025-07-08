import mongoose, { ClientSession } from "mongoose";
import { IUserExercise } from "../interfaces/models/IUserExercise";
import { IUserExerciseRepository } from "../interfaces/repositories/IUserExerciseRepository";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserExerciseModel from "../models/UserExerciseModel";
import { Service } from "typedi";

@Service()
class UserExerciseRepository implements IUserExerciseRepository {
  async createUserExercise(
    data: object,
    session?: ClientSession
  ): Promise<IUserExercise | null> {
    try {
      const userExercise = await UserExerciseModel.create([data], { session });
      return userExercise[0];
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

  async updateUserExercise(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IUserExercise | null> {
    try {
      const userExercise = await UserExerciseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { $set: data },
        { session, new: true }
      );

      if (!userExercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
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
  }

  async deleteUserExercise(
    id: string,
    session?: ClientSession
  ): Promise<IUserExercise | null> {
    try {
      const userExercise = await UserExerciseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
        { session, new: true }
      );

      if (!userExercise) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
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
  }

  async getUserExercise(id: string): Promise<IUserExercise | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };

      const userExercise = await UserExerciseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "exercises",
            localField: "exerciseId",
            foreignField: "_id",
            as: "exercise",
          },
        },
        { $unwind: "$exercise" },
      ]);

      if (!userExercise[0]) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Exercise not found"
        );
      }

      return userExercise[0];
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

  async getUserExerciseByExerciseId(
    userId: string,
    exerciseId: string
  ): Promise<IUserExercise | null> {
    try {
      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        exerciseId: new mongoose.Types.ObjectId(exerciseId),
        isDeleted: false,
      };

      const userExercise = await UserExerciseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "exercises",
            localField: "exerciseId",
            foreignField: "_id",
            as: "exercise",
          },
        },
        { $unwind: "$exercise" },
      ]);

      return userExercise[0];
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

  async getUserExercises(userId: string, query: IQuery): Promise<IPagination> {
    try {
      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      };

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

      const userExercises = await UserExerciseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "exercises",
            localField: "exerciseId",
            foreignField: "_id",
            as: "exercise",
          },
        },
        { $unwind: "$exercise" },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await UserExerciseModel.countDocuments(matchQuery);

      return {
        data: userExercises,
        page: query.page,
        totalPages: Math.ceil(total / query.size),
        total: total,
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

  async getUserExercisesByLessonId(
    userId: string,
    lessonId: string
  ): Promise<IUserExercise[]> {
    try {
      // Validate inputs
      if (
        !mongoose.isValidObjectId(userId) ||
        !mongoose.isValidObjectId(lessonId)
      ) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid user ID or lesson ID"
        );
      }

      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      };

      const userExercises = await UserExerciseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "exercises",
            localField: "exerciseId",
            foreignField: "_id",
            as: "exercise",
          },
        },
        { $unwind: "$exercise" },
        {
          $match: {
            "exercise.lessonId": new mongoose.Types.ObjectId(lessonId),
            "exercise.isDeleted": false,
          },
        },
      ]);

      return userExercises as IUserExercise[];
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

  async markAllExercisesInLessonAsCompleted(
    userId: string,
    lessonId: string,
    exerciseIds: mongoose.Types.ObjectId[],
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      // Update existing records
      const updateResult = await UserExerciseModel.updateMany(
        {
          userId: new mongoose.Types.ObjectId(userId),
          exerciseId: { $in: exerciseIds },
          isDeleted: false,
        },
        { $set: { completed: true } },
        { session }
      );

      // Find which exercises don't have records yet
      const existingRecords = await UserExerciseModel.find(
        {
          userId: new mongoose.Types.ObjectId(userId),
          exerciseId: { $in: exerciseIds },
          isDeleted: false,
        },
        { exerciseId: 1 },
        { session }
      );

      const existingExerciseIds = existingRecords.map((record) =>
        record.exerciseId.toString()
      );

      const newExerciseIds = exerciseIds.filter(
        (id) => !existingExerciseIds.includes(id.toString())
      );

      // Create records for exercises that don't have them yet
      if (newExerciseIds.length > 0) {
        const bulkOps = newExerciseIds.map((exerciseId) => ({
          insertOne: {
            document: {
              userId: new mongoose.Types.ObjectId(userId),
              exerciseId: exerciseId,
              completed: true,
            },
          },
        }));

        await UserExerciseModel.bulkWrite(bulkOps, { session });
      }

      return true;
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

export default UserExerciseRepository;
