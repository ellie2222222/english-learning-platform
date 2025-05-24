import express from "express";

// import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import UserController from "../controllers/UserController";
import UserService from "../services/UserService";

import UserRepository from "../repositories/UserRepository";
import { uploadFile } from "../middlewares/storeFile";
import UserDto from "../dtos/UserDto";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController: UserController = new UserController(userService);
const userDto = new UserDto();
const userRoutes = express.Router();

userRoutes.use(AuthMiddleware);

userRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  userDto.getUsers,
  userController.getUsers
);

userRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  userDto.getUserById,
  userController.getUserById
);

userRoutes.patch(
  "/:id",
  uploadFile.single("avatar"),
  RoleMiddleware([UserEnum.ADMIN]),
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
