import { Router } from "express";
import AchievementController from "../controllers/AchievementController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import AchievementDto from "../dtos/AchievementDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const achiementController = Container.get(AchievementController);
const achievementDto = new AchievementDto();
const achievementRoutes = Router();

achievementRoutes.use(AuthMiddleware);

achievementRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.createAchievement,
  achiementController.createAchievement
);

achievementRoutes.get(
  "/",
  achievementDto.getAchievements,
  achiementController.getAchievements
);

achievementRoutes.get(
  "/:id",
  achievementDto.getAchievement,
  achiementController.getAchievement
);

achievementRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.updateAchievement,
  achiementController.updateAchievement
);

achievementRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.deleteAchievement,
  achiementController.deleteAchievement
);

export default achievementRoutes;
