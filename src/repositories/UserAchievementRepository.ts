import mongoose, { ClientSession } from "mongoose";
import { IUserAchievement } from "../interfaces/models/IUserAchievement";
import { IUserAchievementRepository } from "../interfaces/repositories/IUserAchievementRepository";
import UserAchieventModel from "../models/UserAchievementModel";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import { Service } from "typedi";
import getLogger from "../utils/logger";
import { IPagination } from "../interfaces/others/IPagination";
import UserModel from "../models/UserModel";

@Service()
class UserAchievementRepository implements IUserAchievementRepository {
  async createUserAchievement(
    data: object,
    session?: ClientSession
  ): Promise<IUserAchievement | null> {
    try {
      const userAchievement = await UserAchieventModel.create([data], {
        session,
      });

      return userAchievement[0];
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

  //would not make this an api
  async updateUserAchievement(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IUserAchievement | null> {
    try {
      const userAchievement = await UserAchieventModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        {
          ...data,
        },
        { session, new: true }
      );

      if (!userAchievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User Achievement not found"
        );
      }

      return userAchievement;
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

  //would not make this an api
  async deleteUserAchievement(
    id: string,
    session?: ClientSession
  ): Promise<IUserAchievement | null> {
    try {
      const userAchievement = await UserAchieventModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { session, new: true }
      );

      if (!userAchievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User Achievement not found"
        );
      }

      return userAchievement;
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

  async getUserAchievement(id: string): Promise<IUserAchievement | null> {
    try {
      const userAchievement = await UserAchieventModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      }).populate("achievementId");

      if (!userAchievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User Achievement not found"
        );
      }

      return userAchievement;
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

  async getUserAchievements(
    query: IQuery,
    userId: string
  ): Promise<IPagination> {
    type SearchQuery = {
      userId: mongoose.Types.ObjectId;
      isDeleted?: boolean;
      "achievement.name"?: { $regex: string; $options: string };
    };
    try {
      const matchQuery: SearchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      };

      if (query.search) {
        matchQuery["achievement.name"] = {
          $regex: query.search,
          $options: "i",
        };
      }

      let sortField = "createdAt";
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;
        case SortByType.NAME:
          sortField = "achievement.name";
          break;
        default:
          break;
      }

      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      const skip = (query.page - 1) * query.size;

      const userAchievements = await UserAchieventModel.aggregate([
        {
          $lookup: {
            from: "achievements",
            localField: "achievementId",
            foreignField: "_id",
            as: "achievement",
          },
        },
        { $unwind: "$achievement" },
        { $match: matchQuery },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await UserModel.countDocuments(matchQuery);
      return {
        data: userAchievements,
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

  async deleteBatchUserAchievements(
    achievementId: string,
    session?: mongoose.ClientSession
  ): Promise<number> {
    let count = -1;
    try {
      const logger = getLogger("USER ACHIEVEMENTS");
      const result = await UserAchieventModel.deleteMany(
        {
          achievementId: new mongoose.Types.ObjectId(achievementId),
          isDeleted: false,
        },
        { session }
      );

      logger.info(
        `Achievement ${achievementId} has been removed along with ${result.deletedCount} related user achievement`
      );
      count = result.deletedCount;
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

  async findExistingAchievement(
    achievementId: string,
    userId: string
  ): Promise<IUserAchievement | null> {
    try {
      const achievement = await UserAchieventModel.findOne({
        achievementId: new mongoose.Types.ObjectId(achievementId),
        userId: new mongoose.Types.ObjectId(userId),
      });
      return achievement;
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

export default UserAchievementRepository;
