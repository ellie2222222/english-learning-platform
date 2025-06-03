import mongoose from "mongoose";
import { IAchievementRepository } from "../interfaces/repositories/IAchievementRepository";
import { IAchievement } from "../interfaces/models/IAchievement";
import AchievementModel from "../models/AchievementModel";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class AchievementRepository implements IAchievementRepository {
  async createAchievement(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IAchievement> {
    try {
      const achievement = await AchievementModel.create([data], { session });

      return achievement[0];
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

  async updateAchievement(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IAchievement | null> {
    try {
      const achievement = await AchievementModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );

      if (!achievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }

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

  async deleteAchievement(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IAchievement | null> {
    try {
      const achievement = await AchievementModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      if (!achievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }
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

  async getAchievement(id: string): Promise<IAchievement | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const achievement = await AchievementModel.findOne(matchQuery);

      if (!achievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }
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

  async getAchievements(query: IQuery, type?: string): Promise<IPagination> {
    type SearchQuery = { type?: string; name?: string; isDeleted: false };
    try {
      const matchQuery: SearchQuery = { isDeleted: false };

      if (type) {
        matchQuery.type = type;
      }

      if (query.search) {
        matchQuery.name = query.search;
      }

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

      const achievements = await AchievementModel.aggregate([
        { $match: matchQuery },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await AchievementModel.countDocuments(matchQuery);

      return {
        data: achievements,
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

  async getClosestAchievement(type: string, currentProgress: number) {
    try {
      const achievement = await AchievementModel.findOne({
        type,
        goal: { $gte: currentProgress },
      })
        .sort({ goal: 1 })
        .lean();

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

  async getExistingAchievement(
    name?: string,
    type?: string,
    goal?: number,
    id?: string
  ): Promise<IAchievement | null> {
    try {
      const matchQuery: Record<string, any>[] = [];

      if (!name && (!type || goal === undefined)) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Missing required fields"
        );
      }

      const escapeRegex = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (name) {
        id
          ? matchQuery.push({
              _id: { $ne: new mongoose.Types.ObjectId(id) },
              name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
              isDeleted: false,
            })
          : matchQuery.push({
              name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
              isDeleted: false,
            });
      }

      if (type && goal !== undefined) {
        id
          ? matchQuery.push({
              _id: { $ne: new mongoose.Types.ObjectId(id) },
              type: type,
              goal: { $eq: goal },
              isDeleted: false,
            })
          : matchQuery.push({
              type: type,
              goal: { $eq: goal },
              isDeleted: false,
            });
      }

      if (matchQuery.length === 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "No valid search conditions provided"
        );
      }

      const achievement = await AchievementModel.findOne({
        $or: matchQuery,
        isDeleted: false,
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

export default AchievementRepository;
