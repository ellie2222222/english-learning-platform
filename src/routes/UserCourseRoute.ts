import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserCourseController from "../controllers/UserCourseController";
import UserCourseDto from "../dtos/UserCourseDto";

const userCourseController = Container.get(UserCourseController);
const userCourseDto = new UserCourseDto();
const userCourseRoutes = Router();

userCourseRoutes.use(AuthMiddleware);

userCourseRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  userCourseDto.createUserCourse,
  userCourseController.createUserCourse
); 

userCourseRoutes.get(
  "/:userCourseId",
  userCourseDto.getUserCourseById,
  userCourseController.getUserCourseById
);

export default userCourseRoutes;
