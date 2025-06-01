import { Router } from "express";
import Container from "typedi";
import UserAchievementController from "../controllers/UserAchievementController";
import UserAchievementDto from "../dtos/UserAchievementDto";
import AuthMiddleware from "../middlewares/AuthMiddleware";

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

userAchievementRouter.get("/", userAchievementController.getUserAchievements);
userAchievementRouter.get("/:id", userAchievementController.getUserAchievement);

export default userAchievementRouter;
