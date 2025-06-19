import mongoose from "mongoose";
import { IUserLesson } from "../interfaces/models/IUserLesson";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";
import UserLessonModel from "../models/UserLessonModel";
import { UserLessonStatus } from "../enums/UserLessonStatus";

@Service()
class UserLessonRepository implements IUserLessonRepository {
  async createUserLesson(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserLesson> {
    try {
      const userLesson = await UserLessonModel.create([data], { session });
      return userLesson[0];
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

  async updateUserLesson(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserLesson | null> {
    try {
      const userLesson = await UserLessonModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );
      if (!userLesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserLesson not found"
        );
      }
      return userLesson;
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

  async deleteUserLesson(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IUserLesson | null> {
    try {
      const userLesson = await UserLessonModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );
      if (!userLesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserLesson not found"
        );
      }
      return userLesson;
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

  async getUserLessonById(id: string): Promise<IUserLesson | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const userLesson = await UserLessonModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonId",
            foreignField: "_id",
            as: "lesson",
          },
        },
        { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
      ]);

      if (!userLesson || userLesson.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserLesson not found"
        );
      }

      return userLesson[0];
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

  async getUserLessonsByUserId(
    userId: string,
    query: IQuery
  ): Promise<IPagination> {
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
          sortField = "name";
          break;
        default:
          break;
      }
      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      const skip = (query.page - 1) * query.size;

      const userLessons = await UserLessonModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonId",
            foreignField: "_id",
            as: "lesson",
          },
        },
        { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await UserLessonModel.countDocuments(matchQuery);

      return {
        data: userLessons,
        page: query.page,
        total: total,
        totalPages: Math.ceil(total / query.size),
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

  async checkExistingUserLesson(
    userId: string,
    lessonId: string
  ): Promise<boolean> {
    try {
      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        lessonId: new mongoose.Types.ObjectId(lessonId),
        isDeleted: false,
      };
      const existingUserLesson = await UserLessonModel.findOne(matchQuery);
      return !!existingUserLesson;
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

  async getExistingUserLesson(
    userId: string,
    lessonId: string
  ): Promise<IUserLesson | null> {
    try {
      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        lessonId: new mongoose.Types.ObjectId(lessonId),
        isDeleted: false,
      };
      const existingUserLesson = await UserLessonModel.findOne(matchQuery);
      return existingUserLesson;
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

  async getUserLessonForLessonAchievement(
    userId: string
  ): Promise<IUserLesson[]> {
    try {
      const userLessons = await UserLessonModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        status: UserLessonStatus.COMPLETED,
      });

      return userLessons;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve user lessons"
      );
    }
  }
}

export default UserLessonRepository;
