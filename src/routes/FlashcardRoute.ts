import { Router } from "express";
import Container from "typedi";
import FlashcardController from "../controllers/FlashcardController";
import FlashcardDto from "../dtos/FlashcardDto";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const flashcardRoutes = Router();
const flashcardController = Container.get(FlashcardController);
const flashcardDto = new FlashcardDto();

flashcardRoutes.use(AuthMiddleware);

flashcardRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardDto.createFlashcard,
  flashcardController.createFlashcard
);

flashcardRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardDto.updateFlashcard,
  flashcardController.updateFlashcard
);

flashcardRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardDto.deleteFlashcard,
  flashcardController.deleteFlashcard
);

flashcardRoutes.get(
  "/:id/flashcard-set",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardDto.getFlashcards,
  flashcardController.getFlashcards
);

flashcardRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  flashcardDto.getFlashcard,
  flashcardController.getFlashcard
);

export default flashcardRoutes;
