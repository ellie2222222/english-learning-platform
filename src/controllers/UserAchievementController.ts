import { Inject, Service } from "typedi";
import UserAchievementService from "../services/UserAchievementService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import { IUserAchievementService } from "../interfaces/services/IUserAchievementService";

@Service()
class UserAchievementController {
  constructor(
    @Inject(() => UserAchievementService)
    private userAchievementService: IUserAchievementService
  ) {}

  createUserAchievement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.userInfo;
      const { achievementId } = req.body;
      const userAchievement =
        await this.userAchievementService.createUserAchievement(
          userId,
          achievementId
        );
      res.status(StatusCodeEnum.Created_201).json({
        userAchievement: userAchievement,
        message: "User Achievement created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserAchievement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const userAchievement =
        await this.userAchievementService.getUserAchievement(id, requesterId);
      res.status(StatusCodeEnum.OK_200).json({
        userAchievement: userAchievement,
        message: "Get user achievement successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserAchievements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, search, order, sortBy } = req.query;
      const userId = req.params.id;
      const requesterId = req.userInfo.userId;
      const userAchievements =
        await this.userAchievementService.getUserAchievements(
          {
            page: parseInt(page as string) || 1,
            size: parseInt(size as string) || 5,
            order: (order as OrderType) || "asc",
            sortBy: (sortBy as SortByType) || "date",
            search: (search as string) || "",
          },
          userId,
          requesterId
        );
      res.status(StatusCodeEnum.OK_200).json({
        userAchievements: userAchievements,
        message: "Get user achievements successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserAchievementController;
