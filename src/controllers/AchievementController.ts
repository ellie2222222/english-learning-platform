import { Inject, Service } from "typedi";
import AchievementService from "../services/AchievementService";
import { IAchievementService } from "../interfaces/services/IAchievementService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
@Service()
class AchievementController {
  constructor(
    @Inject(() => AchievementService)
    private achievementService: IAchievementService
  ) {}

  createAchievement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, description, type, goal } = req.body;
      const achievement = await this.achievementService.createAchievement(
        name,
        description,
        type,
        goal
      );
      res.status(StatusCodeEnum.Created_201).json({
        achievement: achievement,
        message: "Achievement created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateAchievement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, type, goal } = req.body;
      const achievement = await this.achievementService.updateAchievement(
        id,
        name,
        description,
        type,
        goal
      );
      res.status(StatusCodeEnum.OK_200).json({
        achievement: achievement,
        message: "Achievement updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAchievement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const achievement = await this.achievementService.deleteAchievement(id);
      res.status(StatusCodeEnum.OK_200).json({
        achievement: achievement,
        message: "Achievement deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getAchievement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const achievement = await this.achievementService.getAchievement(id);
      res.status(StatusCodeEnum.OK_200).json({
        achievement: achievement,
        message: "Achievement get successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getAchievements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy, search, type } = req.query;
      const achievements = await this.achievementService.getAchievements(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 5,
          order: (order as OrderType) || "asc",
          sortBy: (sortBy as SortByType) || "date",
          search: (search as string) || "",
        },
        type as string
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...achievements,
        message: "Achievement get successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AchievementController;
