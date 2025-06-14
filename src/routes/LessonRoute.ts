import { Router } from "express";
import LessonController from "../controllers/LessonController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import LessonDto from "../dtos/LessonDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { CourseResourceAccessMiddleware } from "../middlewares/ResourceAccessMiddleware";

const lessonController = Container.get(LessonController);
const lessonDto = new LessonDto();
const lessonRoutes = Router();

lessonRoutes.use(AuthMiddleware);

lessonRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.createLesson,
  lessonController.createLesson
);

lessonRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  CourseResourceAccessMiddleware,
  lessonDto.getLessons,
  lessonController.getLessons
);

lessonRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  CourseResourceAccessMiddleware,
  lessonDto.getLessonById,
  lessonController.getLessonById
);

lessonRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.updateLesson,
  lessonController.updateLesson
);

lessonRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.deleteLesson,
  lessonController.deleteLesson
);

export default lessonRoutes;
