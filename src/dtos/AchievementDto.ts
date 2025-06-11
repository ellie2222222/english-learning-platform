import { NextFunction, Request, Response } from "express";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { AchievementTypeEnum } from "../enums/AchievementTypeEnum";
import mongoose from "mongoose";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class AchievementDto {
  async createAchievement(req: Request, res: Response, next: NextFunction) {
    const { name, description, type, goal } = req.body;
    try {
      if (!name || !description || !type || !goal) {
        throw new Error("Missing required field");
      }

      if (!Object.values(AchievementTypeEnum).includes(type)) {
        throw new Error("Invalid type");
      }
      if (goal <= 0) {
        throw new Error("Goal must be greater than 0");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  }

  async updateAchievement(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { name, description, type, goal } = req.body;
    try {
      if (!id) {
        throw new Error("Achievement ID is required");
      }
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid achievement id");
      }

      if (type && !Object.values(AchievementTypeEnum).includes(type)) {
        throw new Error("Invalid type");
      }

      if (goal && goal < 1) {
        throw new Error("Goal must be greater than 0");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  }

  async deleteAchievement(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      if (!id) {
        throw new Error("Achievement ID is required");
      }
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid achievement id");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  }

  async getAchievement(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      if (!id) {
        throw new Error("Achievement ID is required");
      }
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid achievement id");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  }

  async getAchievements(req: Request, res: Response, next: NextFunction) {
    const { page, size, order, sortBy, search, type } = req.query;
    try {
      if (page && parseInt(page as string) < 1) {
        throw new Error("Invalid page number");
      }
      if (size && parseInt(size as string) < 1) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }

      if (
        type &&
        !Object.values(AchievementTypeEnum).includes(type as string)
      ) {
        throw new Error("Invalid type");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  }
}
export default AchievementDto;
