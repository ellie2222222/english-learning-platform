import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";         
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserTestController from "../controllers/UserTestController";
import UserTestDto from "../dtos/UserTestDto";

const userTestController = Container.get(UserTestController);
const userTestDto = new UserTestDto();
const userTestRoutes = Router();

userTestRoutes.use(AuthMiddleware);

userTestRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  userTestDto.createUserTest,
  userTestController.createUserTest
); 

userTestRoutes.get(
  "/:userTestId",
  userTestDto.getUserTestById,
  userTestController.getUserTestById
);

export default userTestRoutes;
