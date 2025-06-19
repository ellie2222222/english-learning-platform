import { Router } from "express";
import LessonController from "../controllers/LessonController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import LessonDto from "../dtos/LessonDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import {
  CourseResourceAccessMiddleware,
  GenericResourceAccessMiddleware,
  LessonResourceAccessMiddleware,
} from "../middlewares/ResourceAccessMiddleware";
import GrammarDto from "../dtos/GrammarDto";
import GrammarController from "../controllers/GrammarController";
import VocabularyDto from "../dtos/VocabularyDto";
import VocabularyController from "../controllers/VocabularyController";
import { uploadFile } from "../middlewares/storeFile";
import { ResourceType } from "../enums/ResourceType";

const lessonController = Container.get(LessonController);
const lessonDto = new LessonDto();
const grammarController = Container.get(GrammarController);
const grammarDto = new GrammarDto();
const vocabularyController = Container.get(VocabularyController);
const vocabularyDto = new VocabularyDto();
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
  RoleMiddleware([UserEnum.ADMIN]),
  lessonDto.getLessons,
  lessonController.getLessons
);

lessonRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  GenericResourceAccessMiddleware(ResourceType.LESSON),
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

lessonRoutes.get(
  "/:id/grammars",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  GenericResourceAccessMiddleware(ResourceType.GRAMMAR),
  grammarDto.getGrammarsByLessonId,
  grammarController.getGrammarsByLessonId
);

lessonRoutes.get(
  "/:id/vocabularies",
  GenericResourceAccessMiddleware(ResourceType.VOCABULARY),
  LessonResourceAccessMiddleware,
  vocabularyDto.getVocabulariesByLessonId,
  vocabularyController.getVocabulariesByLessonId
);

export default lessonRoutes;
