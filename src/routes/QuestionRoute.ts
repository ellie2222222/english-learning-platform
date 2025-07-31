import { Router } from "express";
import { Container } from "typedi";
import QuestionController from "../controllers/QuestionController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { OwnershipMiddleware, ResourceModel } from "../middlewares/OwnershipMiddleware";

const router = Router();
const questionController = Container.get(QuestionController);

// Create a new question
router.post(
  "/",
  AuthMiddleware,
  questionController.createQuestion
);

// Get questions with pagination and filtering
router.get(
  "/",
  AuthMiddleware,
  questionController.getQuestions
);

// Get a specific question by ID
router.get(
  "/:id",
  AuthMiddleware,
  questionController.getQuestion
);

// Update a question
router.put(
  "/:id",
  AuthMiddleware,
  OwnershipMiddleware(ResourceModel.QUESTION),
  questionController.updateQuestion
);

// Delete a question
router.delete(
  "/:id",
  AuthMiddleware,
  OwnershipMiddleware(ResourceModel.QUESTION),
  questionController.deleteQuestion
);

// Get questions by lesson ID
router.get(
  "/lesson/:lessonId",
  AuthMiddleware,
  questionController.getQuestionsByLessonId
);

export default router; 