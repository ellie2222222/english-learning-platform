import { Router } from "express";
import CourseController from "../controllers/CourseController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import CourseDto from "../dtos/CourseDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import LessonDto from "../dtos/LessonDto";
import LessonController from "../controllers/LessonController";

const courseController = Container.get(CourseController);
const lessonController = Container.get(LessonController);
const courseDto = new CourseDto();
const lessonDto = new LessonDto();
const courseRoutes = Router();

courseRoutes.use(AuthMiddleware);

courseRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  courseDto.createCourse,
  courseController.createCourse
);

courseRoutes.get(
  "/",
  courseDto.getCourses,
  courseController.getCourses
);

courseRoutes.get(
  "/:id",
  courseDto.getCourseById,
  courseController.getCourseById
);

courseRoutes.get(
  "/:id/lessons",
  lessonDto.getLessonsByCourseId,
  lessonController.getLessonsByCourseId
);

courseRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  courseDto.updateCourse,
  courseController.updateCourse
);

courseRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  courseDto.deleteCourse,
  courseController.deleteCourse
);

export default courseRoutes;
