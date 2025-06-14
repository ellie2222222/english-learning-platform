import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import mongoose from "mongoose";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class UserAchievementDto {
  async createUserAchievement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { achievementId } = req.body;
      if (!achievementId) {
        throw new Error("Achievement ID is required");
      }
      if (!mongoose.isValidObjectId(achievementId)) {
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

  async getUserAchievement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("User achievement ID is required");
      }
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid user achievement id");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  }

  async getUserAchievements(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, size, search, order, sortBy } = req.query;

      const { id } = req.params;

      if (!id) {
        throw new Error("User ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid user id");
      }

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

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  }
}
export default UserAchievementDto;
