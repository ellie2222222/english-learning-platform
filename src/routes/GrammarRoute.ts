import { Router } from "express";
import GrammarController from "../controllers/GrammarController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import GrammarDto from "../dtos/GrammarDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import {
  GenericResourceAccessMiddleware,
  MembershipAccessLimitMiddleware,
} from "../middlewares/ResourceAccessMiddleware";
import { ResourceType } from "../enums/ResourceType";

const lessonController = Container.get(GrammarController);
const lessonDto = new GrammarDto();
const grammarRoutes = Router();

grammarRoutes.use(AuthMiddleware);

grammarRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.createGrammar,
  lessonController.createGrammar
);

grammarRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.getGrammars,
  lessonController.getGrammars
);

//get grammar by grammarId => id: grammarId => ResourceType.grammarId
grammarRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  MembershipAccessLimitMiddleware(ResourceType.GRAMMAR),
  GenericResourceAccessMiddleware(ResourceType.GRAMMAR),
  lessonDto.getGrammarById,
  lessonController.getGrammarById
);

grammarRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.updateGrammar,
  lessonController.updateGrammar
);

grammarRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.deleteGrammar,
  lessonController.deleteGrammar
);

export default grammarRoutes;
