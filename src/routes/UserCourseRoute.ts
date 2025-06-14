import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserCourseController from "../controllers/UserCourseController";
import UserCourseDto from "../dtos/UserCourseDto";
import { OwnershipMiddleware, ResourceModel } from "../middlewares/OwnershipMiddleware";

const userCourseController = Container.get(UserCourseController);
const userCourseDto = new UserCourseDto();
const userCourseRoutes = Router();

userCourseRoutes.use(AuthMiddleware);

userCourseRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userCourseDto.createUserCourse,
  userCourseController.createUserCourse
); 

userCourseRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  OwnershipMiddleware(ResourceModel.USER_COURSE),
  userCourseDto.getUserCourseById,
  userCourseController.getUserCourseById
);

export default userCourseRoutes;
