import { Router } from "express";
import TestController from "../controllers/TestController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import TestDto from "../dtos/TestDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

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
  testDto.getTests,
  testController.getTests
);

testRoutes.get(
  "/:testId",
  testDto.getTestById,
  testController.getTestById
);

testRoutes.patch(
  "/:testId",
  RoleMiddleware([UserEnum.ADMIN]),
  testDto.updateTest,
  testController.updateTest
);

testRoutes.delete(
  "/:testId",
  RoleMiddleware([UserEnum.ADMIN]),
  testDto.deleteTest,
  testController.deleteTest
);

testRoutes.get(
  "/:testId/lesson/:lessonId",
  testDto.getTestsByLessonId,
  testController.getTestsByLessonId
);

export default testRoutes;
