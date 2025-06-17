import { Router } from "express";
import Container from "typedi";
import UserAchievementController from "../controllers/UserAchievementController";
import UserAchievementDto from "../dtos/UserAchievementDto";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const userAchievementRouter = Router();
const userAchievementController = Container.get(UserAchievementController);
const userAchievementDto = new UserAchievementDto();

userAchievementRouter.use(AuthMiddleware);

// //api for testing
// userAchievementRouter.post(
//   "/",
//   userAchievementDto.createUserAchievement,
//   userAchievementController.createUserAchievement
// );

userAchievementRouter.get(
  "/:id/users",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userAchievementDto.getUserAchievements,
  userAchievementController.getUserAchievements
);

userAchievementRouter.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userAchievementDto.getUserAchievement,
  userAchievementController.getUserAchievement
);

export default userAchievementRouter;
