import { Inject, Service } from "typedi";
import StatisticService from "../services/StatisticService";
import { IStatisticService } from "../interfaces/services/IStatisticService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";

@Service()
class StatisticController {
  constructor(
    @Inject(() => StatisticService) private statisticService: IStatisticService
  ) {}
  getRevenueOverTime = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { time, value } = req.query;
      const result = await this.statisticService.getRevenueOverTime(
        time as string,
        parseInt(value as string)
      );
      res.status(StatusCodeEnum.OK_200).json({
        revenue: result,
        message: "Get revenue over time successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getNewUserOvertime = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { time, value } = req.query;

      const result = await this.statisticService.getNewUsers(
        time as string,
        parseInt(value as string)
      );

      res.status(StatusCodeEnum.OK_200).json({
        newUserOverTime: result,
        message: "Get new user over time successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;

      const userStats = await this.statisticService.getUserStatistics(userId);

      res.status(StatusCodeEnum.OK_200).json({
        statistics: userStats,
        message: "Get user statistics successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getCompletionRate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const completionRate = await this.statisticService.getCompletionRate();

      res.status(StatusCodeEnum.OK_200).json({
        completionRate: completionRate,
        message: "Get completion rate successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveCourseCount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const count = await this.statisticService.getActiveCourseCount();
      res.status(StatusCodeEnum.OK_200).json({ activeCourseCount: count });
    } catch (error) {
      next(error);
    }
  };
}

export default StatisticController;
