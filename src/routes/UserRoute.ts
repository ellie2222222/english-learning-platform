import express from "express";

// import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import UserController from "../controllers/UserController";

import { uploadFile } from "../middlewares/storeFile";
import UserDto from "../dtos/UserDto";
import Container from "typedi";
import UserLessonDto from "../dtos/UserLessonDto";
import UserCourseDto from "../dtos/UserCourseDto";
import UserTestDto from "../dtos/UserTestDto";
import UserLessonController from "../controllers/UserLessonController";
import UserCourseController from "../controllers/UserCourseController";
import UserTestController from "../controllers/UserTestController";

const userController: UserController = Container.get(UserController);
const userLessonController: UserLessonController =
  Container.get(UserLessonController);
const userCourseController: UserCourseController =
  Container.get(UserCourseController);
const userTestController: UserTestController =
  Container.get(UserTestController);
const userDto = new UserDto();
const userLessonDto = new UserLessonDto();
const userCourseDto = new UserCourseDto();
const userTestDto = new UserTestDto();
const userRoutes = express.Router();

userRoutes.use(AuthMiddleware);

userRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  userDto.createUser,
  userController.createUser
);

userRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userDto.getUsers,
  userController.getUsers
);

userRoutes.get(
  "/leaderboard",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER, UserEnum.GUEST]),
  userDto.getTopLeaderBoardUser,
  userController.getTopLeaderBoardUser
);
userRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userDto.getUserById,
  userController.getUserById
);

userRoutes.patch(
  "/:id",
  uploadFile.single("avatar"),
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userDto.updateUser,
  userController.updateUser
);

userRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  userDto.deleteUser,
  userController.deleteUser
);

export default userRoutes;
