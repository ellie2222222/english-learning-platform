import { Router } from "express";
import AchievementController from "../controllers/AchievementController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import AchievementDto from "../dtos/AchievementDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const achievementController = Container.get(AchievementController);
const achievementDto = new AchievementDto();
const achievementRoutes = Router();

achievementRoutes.use(AuthMiddleware);

achievementRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.createAchievement,
  achievementController.createAchievement
);

achievementRoutes.get(
  "/",
  achievementDto.getAchievements,
  achievementController.getAchievements
);

achievementRoutes.get(
  "/:id",
  achievementDto.getAchievement,
  achievementController.getAchievement
);

achievementRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.updateAchievement,
  achievementController.updateAchievement
);

achievementRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  achievementDto.deleteAchievement,
  achievementController.deleteAchievement
);

export default achievementRoutes;
