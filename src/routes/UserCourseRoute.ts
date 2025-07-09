import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserCourseController from "../controllers/UserCourseController";
import UserCourseDto from "../dtos/UserCourseDto";
import {
  OwnershipMiddleware,
  ResourceModel,
} from "../middlewares/OwnershipMiddleware";
import { MembershipAccessLimitMiddleware } from "../middlewares/ResourceAccessMiddleware";
import { ResourceType } from "../enums/ResourceType";

const userCourseController = Container.get(UserCourseController);
const userCourseDto = new UserCourseDto();
const userCourseRoutes = Router();

userCourseRoutes.use(AuthMiddleware);

userCourseRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  //block user from enroll to membership course
  MembershipAccessLimitMiddleware(ResourceType.COURSE),
  userCourseDto.createUserCourse,
  userCourseController.createUserCourse
);

userCourseRoutes.get(
  "/:id/user",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userCourseDto.getUserCoursesByUserId,
  userCourseController.getUserCoursesByUserId
);

userCourseRoutes.get(
  "/:id/course",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  userCourseDto.getUserCourseByCourseId,
  userCourseController.getUserCourseByCourseId
);

userCourseRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  OwnershipMiddleware(ResourceModel.USER_COURSE),
  userCourseDto.getUserCourseById,
  userCourseController.getUserCourseById
);

export default userCourseRoutes;
