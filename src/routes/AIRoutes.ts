import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import AIController from "../controllers/AIController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { MembershipAccessMiddleware, ResourceType } from "../middlewares/MembershipAccessMiddleware";

const aiRoutes = Router();
const aiController = Container.get(AIController);

aiRoutes.use(AuthMiddleware);

aiRoutes.post(
  "/tutor",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessMiddleware(ResourceType.AI_CHAT),
  aiController.askEnglishTutorAI
);

aiRoutes.get(
  "/recommentdations/:id/user",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessMiddleware(ResourceType.AI_CHAT),
  aiController.getPersonalizeLearningRecommendation
);

export default aiRoutes;
