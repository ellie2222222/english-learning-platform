import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import UserExerciseController from "../controllers/UserExerciseController";
import UserExerciseDto from "../dtos/UserExerciseDto";

const userExerciseRoutes = Router();
const userExerciseController = Container.get(UserExerciseController);
const userExerciseDto = new UserExerciseDto();
userExerciseRoutes.use(AuthMiddleware);

userExerciseRoutes.post(
  "/submission",
  userExerciseDto.submitExercise,
  userExerciseController.submitExercise
);
userExerciseRoutes.get(
  "/:id/user",
  userExerciseDto.getUserExercises,
  userExerciseController.getUserExercises
);

userExerciseRoutes.get(
  "/:id/exercise",
  userExerciseDto.getUserExerciseByExerciseId,
  userExerciseController.getUserExerciseByExerciseId
);

userExerciseRoutes.get(
  "/:id",
  userExerciseDto.getUserExercise,
  userExerciseController.getUserExercise
);

export default userExerciseRoutes;
