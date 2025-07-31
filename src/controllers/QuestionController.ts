import { Request, Response } from "express";
import { Container } from "typedi";
import { IQuestionService } from "../interfaces/services/IQuestionService";
import QuestionService from "../services/QuestionService";
import { buildQuery } from "../utils/queryBuilder";

class QuestionController {
  private questionService: IQuestionService;

  constructor() {
    this.questionService = Container.get(QuestionService);
  }

  createQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        lessonId,
        type,
        question,
        answer,
        focus,
        options,
        explanation,
        image,
      } = req.body;

      const createdQuestion = await this.questionService.createQuestion(
        lessonId,
        type,
        question,
        answer,
        focus,
        options,
        explanation,
        image
      );

      res.status(201).json({
        success: true,
        data: createdQuestion,
        message: "Question created successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to create question",
      });
    }
  };

  getQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.query;
      const query = buildQuery(req.query);

      const questions = await this.questionService.getQuestions(
        query,
        lessonId as string
      );

      res.status(200).json({
        success: true,
        data: questions,
        message: "Questions retrieved successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to retrieve questions",
      });
    }
  };

  getQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const question = await this.questionService.getQuestion(id);

      if (!question) {
        res.status(404).json({
          success: false,
          message: "Question not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: question,
        message: "Question retrieved successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to retrieve question",
      });
    }
  };

  updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        question,
        answer,
        focus,
        options,
        explanation,
        image,
      } = req.body;

      const updatedQuestion = await this.questionService.updateQuestion(
        id,
        question,
        answer,
        focus,
        options,
        explanation,
        image
      );

      if (!updatedQuestion) {
        res.status(404).json({
          success: false,
          message: "Question not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedQuestion,
        message: "Question updated successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to update question",
      });
    }
  };

  deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deletedQuestion = await this.questionService.deleteQuestion(id);

      if (!deletedQuestion) {
        res.status(404).json({
          success: false,
          message: "Question not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: deletedQuestion,
        message: "Question deleted successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to delete question",
      });
    }
  };

  getQuestionsByLessonId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const query = buildQuery(req.query);

      const questions = await this.questionService.getQuestions(
        query,
        lessonId
      );

      res.status(200).json({
        success: true,
        data: questions,
        message: "Questions retrieved successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to retrieve questions",
      });
    }
  };
}

export default QuestionController; 