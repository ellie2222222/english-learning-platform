import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";         
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserLessonController from "../controllers/UserLessonController";
import UserLessonDto from "../dtos/UserLessonDto";

const userLessonController = Container.get(UserLessonController);
const userLessonDto = new UserLessonDto();
const userLessonRoutes = Router();

userLessonRoutes.use(AuthMiddleware);

userLessonRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  userLessonDto.createUserLesson,
  userLessonController.createUserLesson
); 

userLessonRoutes.get(
  "/:userLessonId",
  userLessonDto.getUserLessonById,
  userLessonController.getUserLessonById
);

export default userLessonRoutes;
