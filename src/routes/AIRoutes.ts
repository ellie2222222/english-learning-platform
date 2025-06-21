import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import AIController from "../controllers/AIController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const aiRoutes = Router();
const aiController = Container.get(AIController);

aiRoutes.use(AuthMiddleware);

aiRoutes.post(
  "/tutor",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  aiController.askEnglishTutorAI
);

aiRoutes.get(
  "/recommentdations/:id/user",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  aiController.getPersonalizeLearningRecommendation
);

export default aiRoutes;
