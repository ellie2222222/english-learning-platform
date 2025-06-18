import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import UserExerciseController from "../controllers/UserExerciseController";

const userExerciseRoutes = Router();
const userExerciseController = Container.get(UserExerciseController);

userExerciseRoutes.use(AuthMiddleware);

userExerciseRoutes.post("/submition", userExerciseController.submitExercise);
userExerciseRoutes.get("/:id/user", userExerciseController.getUserExercises);
userExerciseRoutes.get("/:id", userExerciseController.getUserExercise);

export default userExerciseRoutes;
