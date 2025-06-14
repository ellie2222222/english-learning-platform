import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import FlashcardSetController from "../controllers/FlashcardSetController";
import FlashcardSetDto from "../dtos/FlashcardSetDto";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const flashcardSetRoutes = Router();
const flashcardSetController = Container.get(FlashcardSetController);
const flashcardSetDto = new FlashcardSetDto();

flashcardSetRoutes.use(AuthMiddleware);

flashcardSetRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardSetDto.createFlashcardSet,
  flashcardSetController.createFlashcardSet
);

flashcardSetRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardSetDto.updateFlashcardSet,
  flashcardSetController.updateFlashcardSet
);

flashcardSetRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardSetDto.deleteFlashcardSet,
  flashcardSetController.deleteFlashcardSet
);

flashcardSetRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardSetDto.getFlashcardSets,
  flashcardSetController.getFlashcardSets
);

flashcardSetRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardSetDto.getFlashcardSet,
  flashcardSetController.getFlashcardSet
);

export default flashcardSetRoutes;
