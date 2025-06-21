import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import ExerciseController from "../controllers/ExerciseController";
import ExerciseDto from "../dtos/ExerciseDto";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { uploadFile } from "../middlewares/storeFile";
import {
  GenericResourceAccessMiddleware,
  MembershipAccessLimitMiddleware,
} from "../middlewares/ResourceAccessMiddleware";
import { ResourceType } from "../enums/ResourceType";

const exerciseRoutes = Router();
const exerciseController = Container.get(ExerciseController);
const exerciseDto = new ExerciseDto();

exerciseRoutes.use(AuthMiddleware);

exerciseRoutes.post(
  "/",
  uploadFile.fields([{ name: "exerciseImage", maxCount: 1 }]),
  RoleMiddleware([UserEnum.ADMIN]),
  exerciseDto.createExercise,
  exerciseController.createExercise
);

exerciseRoutes.patch(
  "/:id",
  uploadFile.fields([{ name: "exerciseImage", maxCount: 1 }]),
  RoleMiddleware([UserEnum.ADMIN]),
  exerciseDto.updateExercise,
  exerciseController.updateExercise
);

exerciseRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  exerciseDto.deleteExercise,
  exerciseController.deleteExercise
);

//get exercise by lessonId => id: lessonId => ResourceType.LESSON
exerciseRoutes.get(
  "/:id/lesson",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessLimitMiddleware(ResourceType.LESSON),
  GenericResourceAccessMiddleware(ResourceType.LESSON),
  exerciseDto.getExercises,
  exerciseController.getExercises
);

//get exercise by exerciseId => id: exerciseId => ResourceType.EXERCISE
exerciseRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessLimitMiddleware(ResourceType.EXERCISE),
  GenericResourceAccessMiddleware(ResourceType.EXERCISE),
  exerciseDto.getExercise,
  exerciseController.getExercise
);

export default exerciseRoutes;
