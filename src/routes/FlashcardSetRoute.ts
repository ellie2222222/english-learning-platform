import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import FlashcardSetController from "../controllers/FlashcardSetController";
import FlashcardSetDto from "../dtos/FlashcardSetDto";

const flashcardSetRoutes = Router();
const flashcardSetController = Container.get(FlashcardSetController);
const flashcardSetDto = new FlashcardSetDto();

flashcardSetRoutes.use(AuthMiddleware);

flashcardSetRoutes.post(
  "/",
  flashcardSetDto.createFlashcardSet,
  flashcardSetController.createFlashcardSet
);

flashcardSetRoutes.patch(
  "/:id",
  flashcardSetDto.updateFlashcardSet,
  flashcardSetController.updateFlashcardSet
);

flashcardSetRoutes.delete(
  "/:id",
  flashcardSetDto.deleteFlashcardSet,
  flashcardSetController.deleteFlashcardSet
);

flashcardSetRoutes.get(
  "/",
  flashcardSetDto.getFlashcardSets,
  flashcardSetController.getFlashcardSets
);

flashcardSetRoutes.get(
  "/:id",
  flashcardSetDto.getFlashcardSet,
  flashcardSetController.getFlashcardSet
);

export default flashcardSetRoutes;
