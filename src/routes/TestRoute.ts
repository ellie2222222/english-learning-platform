import { Router } from "express";
import TestController from "../controllers/TestController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import TestDto from "../dtos/TestDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import {
  GenericResourceAccessMiddleware, 
  MembershipAccessLimitMiddleware,
} from "../middlewares/ResourceAccessMiddleware";
import { ResourceType } from "../enums/ResourceType";

const testController = Container.get(TestController);
const testDto = new TestDto();
const testRoutes = Router();

testRoutes.use(AuthMiddleware);

testRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  testDto.createTest,
  testController.createTest
);

//get test by courseId => id:courseId => ResourceType.COURSE
testRoutes.get(
  "/:id/course",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessLimitMiddleware(ResourceType.COURSE),
  GenericResourceAccessMiddleware(ResourceType.COURSE),
  testDto.getTests,
  testController.getTests
);

//get test by testId => id:testId => ResourceType.TEST
testRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessLimitMiddleware(ResourceType.TEST),
  GenericResourceAccessMiddleware(ResourceType.TEST),
  testDto.getTestById,
  testController.getTestById
);

testRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  testDto.updateTest,
  testController.updateTest
);

testRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  testDto.deleteTest,
  testController.deleteTest
);

testRoutes.post("/:id/submission",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessLimitMiddleware(ResourceType.TEST),
  GenericResourceAccessMiddleware(ResourceType.TEST),
  testDto.submitTest,
  testController.submitTest
); 

//get test by lessonId => id:lessonId => ResourceType.LESSON
testRoutes.get(
  "/lesson/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessLimitMiddleware(ResourceType.LESSON),
  GenericResourceAccessMiddleware(ResourceType.LESSON),
  testDto.getTestsByLessonId,
  testController.getTestsByLessonId
);

export default testRoutes;
