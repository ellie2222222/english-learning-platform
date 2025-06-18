import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import ExerciseController from "../controllers/ExerciseController";
import ExerciseDto from "../dtos/ExerciseDto";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { uploadFile } from "../middlewares/storeFile";
import { GenericResourceAccessMiddleware } from "../middlewares/ResourceAccessMiddleware";
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

exerciseRoutes.get(
  "/:id/lesson",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  (req, res, next) => {
    GenericResourceAccessMiddleware(ResourceType.LESSON)(req, res, next).catch(
      next
    );
  },
  exerciseDto.getExercises,
  exerciseController.getExercises
);

exerciseRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  (req, res, next) => {
    GenericResourceAccessMiddleware(ResourceType.EXERCISE)(
      req,
      res,
      next
    ).catch(next);
  },
  exerciseDto.getExercise,
  exerciseController.getExercise
);

export default exerciseRoutes;
