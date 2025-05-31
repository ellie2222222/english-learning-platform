import { Router } from "express";
import AchievementController from "../controllers/AchievementController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import AchievementDto from "../dtos/AchievementDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const achiementController = Container.get(AchievementController);
const achievementDto = new AchievementDto();
const achievementRoute = Router();

achievementRoute.use(AuthMiddleware);

achievementRoute.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.createAchievement,
  achiementController.createAchievement
);

achievementRoute.get(
  "/",
  achievementDto.getAchievements,
  achiementController.getAchievements
);

achievementRoute.get(
  "/:id",
  achievementDto.getAchievement,
  achiementController.getAchievement
);

achievementRoute.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.updateAchievement,
  achiementController.updateAchievement
);

achievementRoute.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.deleteAchievement,
  achiementController.deleteAchievement
);

export default achievementRoute;
