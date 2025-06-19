import { Router } from "express";
import VocabularyController from "../controllers/VocabularyController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import VocabularyDto from "../dtos/VocabularyDto";
import Container from "typedi";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { CourseResourceAccessMiddleware, GenericResourceAccessMiddleware } from "../middlewares/ResourceAccessMiddleware";
import { uploadFile } from "../middlewares/storeFile";
import { ResourceType } from "../enums/ResourceType";

const vocabularyController = Container.get(VocabularyController);
const vocabularyDto = new VocabularyDto();
const vocabularyRoutes = Router();

vocabularyRoutes.use(AuthMiddleware);

vocabularyRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  uploadFile.single("vocabularyImage"),
  vocabularyDto.createVocabulary,
  vocabularyController.createVocabulary
);

vocabularyRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  vocabularyDto.getVocabularies,
  vocabularyController.getVocabularies
);

vocabularyRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  GenericResourceAccessMiddleware(ResourceType.VOCABULARY),
  vocabularyDto.getVocabularyById,
  vocabularyController.getVocabularyById
);

vocabularyRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  uploadFile.single("vocabularyImage"),
  vocabularyDto.updateVocabulary,
  vocabularyController.updateVocabulary
);

vocabularyRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  vocabularyDto.deleteVocabulary,
  vocabularyController.deleteVocabulary
);

export default vocabularyRoutes;
