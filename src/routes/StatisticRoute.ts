import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import Container from "typedi";
import StatisticController from "../controllers/StatisticController";
import StatisticDto from "../dtos/StatisticDto";

const statisticRoutes = Router();
const statisticController = Container.get(StatisticController);
const statisticDto = new StatisticDto();

statisticRoutes.use(AuthMiddleware);
statisticRoutes.use(RoleMiddleware([UserEnum.ADMIN]));

statisticRoutes.get(
  "/revenue",
  statisticDto.getRevenueOverTime,
  statisticController.getRevenueOverTime
);

statisticRoutes.get(
  "/new-users",
  statisticDto.getNewUsersOvertime,
  statisticController.getNewUserOvertime
);

// Add the new endpoint for user statistics
statisticRoutes.get(
  "/user/:userId",
  statisticController.getUserStatistics
);

statisticRoutes.get(
  "/completion-rate",
  statisticController.getCompletionRate
);

statisticRoutes.get(
  "/active-courses",
  statisticController.getActiveCourseCount
);

statisticRoutes.get(
  "/total-users",
  statisticController.getTotalUserCount
);

export default statisticRoutes;
