import { Inject, Service } from "typedi";
import FlashcardService from "../services/FlashcardService";
import { IFlashcardService } from "../interfaces/services/IFlashcardService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

@Service()
class FlashcardController {
  constructor(
    @Inject(() => FlashcardService) private flashcardService: IFlashcardService
  ) {}

  createFlashcard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { englishContent, vietnameseContent, flashcardSetId } = req.body;

      const userId = req.userInfo.userId;

      const flashcard = await this.flashcardService.createFlashcard(
        userId,
        englishContent,
        vietnameseContent,
        flashcardSetId
      );

      res.status(StatusCodeEnum.Created_201).json({
        flashcard: flashcard,
        message: "Flashcard created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateFlashcard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { englishContent, vietnameseContent } = req.body;
      const { id } = req.params;
      const userId = req.userInfo.userId;

      const flashcard = await this.flashcardService.updateFlashcard(
        id,
        userId,
        englishContent,
        vietnameseContent
      );

      res.status(StatusCodeEnum.OK_200).json({
        flashcard: flashcard,
        message: "Flashcard updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteFlashcard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, role } = req.userInfo;

      const flashcard = await this.flashcardService.deleteFlashcard(
        id,
        userId,
        role
      );

      res.status(StatusCodeEnum.OK_200).json({
        flashcard: flashcard,
        message: "Flashcard deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getFlashcards = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, search, order, sortBy } = req.query;
      const { id } = req.params;

      const flashcards = await this.flashcardService.getFlashcards(id, {
        page: page ? parseInt(page as string) : 1,
        size: size ? parseInt(size as string) : 10,
        order: order as OrderType,
        sortBy: sortBy as SortByType,
        search: search as string,
      });

      res.status(StatusCodeEnum.OK_200).json({
        ...flashcards,
        message: "Flashcards retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getFlashcard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const flashcard = await this.flashcardService.getFlashcard(id);
      res.status(StatusCodeEnum.OK_200).json({
        flashcard: flashcard,
        message: "Flashcard retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default FlashcardController;
