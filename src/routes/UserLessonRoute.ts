import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserLessonController from "../controllers/UserLessonController";
import UserLessonDto from "../dtos/UserLessonDto";
import {
  OwnershipMiddleware,
  ResourceModel,
} from "../middlewares/OwnershipMiddleware";

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

userLessonRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  OwnershipMiddleware(ResourceModel.USER_LESSON),
  userLessonDto.updateUserLesson,
  userLessonController.updateUserLesson
);

userLessonRoutes.get(
  "/:id/lesson",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userLessonDto.getUserLessonByLessonId,
  userLessonController.getUserLessonByLessonId
);

userLessonRoutes.get(
  "/:id/user",
  RoleMiddleware([UserEnum.ADMIN]),
  userLessonDto.getUserLessonsByUserId,
  userLessonController.getUserLessonsByUserId
);

userLessonRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  OwnershipMiddleware(ResourceModel.USER_LESSON),
  userLessonDto.getUserLessonById,
  userLessonController.getUserLessonById
);

export default userLessonRoutes;
