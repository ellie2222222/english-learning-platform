import { Router } from "express";
import TestController from "../controllers/TestController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import TestDto from "../dtos/TestDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import {
  GenericResourceAccessMiddleware,
  LessonResourceAccessMiddleware,
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

testRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  LessonResourceAccessMiddleware,
  testDto.getTests,
  testController.getTests
);

testRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  (req, res, next) => {
    GenericResourceAccessMiddleware(ResourceType.TEST)(req, res, next).catch(
      next
    );
  },
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

testRoutes.get(
  "/lesson/:id",
  (req, res, next) => {
    GenericResourceAccessMiddleware(ResourceType.LESSON)(req, res, next).catch(
      next
    );
  },
  testDto.getTestsByLessonId,
  testController.getTestsByLessonId
);

export default testRoutes;
