import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import UserExerciseController from "../controllers/UserExerciseController";

const userExerciseRoutes = Router();
const userExercistController = Container.get(UserExerciseController);

userExerciseRoutes.use(AuthMiddleware);

userExerciseRoutes.post("/submit", userExercistController.submitExercise);
userExerciseRoutes.get("/:id/user", userExercistController.getUserExercises);
userExerciseRoutes.get("/:id", userExercistController.getUserExercise);

export default userExerciseRoutes;
