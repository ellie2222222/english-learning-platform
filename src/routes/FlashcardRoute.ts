import { Router } from "express";
import Container from "typedi";
import FlashcardController from "../controllers/FlashcardController";
import FlashcardDto from "../dtos/FlashcardDto";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const flashcardRoutes = Router();
const flashcardController = Container.get(FlashcardController);
const flashcardDto = new FlashcardDto();

flashcardRoutes.use(AuthMiddleware);

flashcardRoutes.post(
  "/",
  flashcardDto.createFlashcard,
  flashcardController.createFlashcard
);

flashcardRoutes.patch(
  "/:id",
  flashcardDto.updateFlashcard,
  flashcardController.updateFlashcard
);

flashcardRoutes.delete(
  "/:id",
  flashcardDto.deleteFlashcard,
  flashcardController.deleteFlashcard
);

flashcardRoutes.get(
  "/:id/flashcard-set",
  flashcardDto.getFlashcards,
  flashcardController.getFlashcards
);

flashcardRoutes.get(
  "/:id",
  flashcardDto.getFlashcard,
  flashcardController.getFlashcard
);

export default flashcardRoutes;
