import { Inject, Service } from "typedi";
import { IFlashcardSetService } from "../interfaces/services/IFlashcardSetService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import FlashcardSetService from "../services/FlashcardSetService";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

@Service()
class FlashcardSetController {
  constructor(
    @Inject(() => FlashcardSetService)
    private flashcardSetService: IFlashcardSetService
  ) {}

  createFlashcardSet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, description } = req.body;
      const { userId } = req.userInfo;
      const flashcardSet = await this.flashcardSetService.createFlashcardSet(
        name,
        userId,
        description
      );

      res.status(StatusCodeEnum.Created_201).json({
        flashcardSet: flashcardSet,
        message: "Flashcard set created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateFlashcardSet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const { userId } = req.userInfo;
      const flashcardSet = await this.flashcardSetService.updateFlashcardSet(
        id,
        userId,
        name,
        description
      );

      res.status(StatusCodeEnum.OK_200).json({
        flashcardSet: flashcardSet,
        message: "Flashcard set updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteFlashcardSet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { userId } = req.userInfo;
      const flashcardSet = await this.flashcardSetService.deleteFlashcardSet(
        id,
        userId
      );

      res.status(StatusCodeEnum.OK_200).json({
        flashcardSet: flashcardSet,
        message: "Flashcard set deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getFlashcardSets = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, size, search, order, sortBy, userId } = req.query;

      const flashcardSets = await this.flashcardSetService.getFlashcardSets(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 5,
          order: (order as OrderType) || "asc",
          sortBy: (sortBy as SortByType) || "date",
          search: (search as string) || "",
        },
        userId as string
      );

      res.status(StatusCodeEnum.OK_200).json({
        ...flashcardSets,
        message: "Flashcard sets retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getFlashcardSet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const flashcardSet = await this.flashcardSetService.getFlashcardSet(id);

      res.status(StatusCodeEnum.OK_200).json({
        flashcardSet: flashcardSet,
        message: "Flashcard set retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getFlashcardSetsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const flashcardSets = await this.flashcardSetService.getFlashcardSetsByUserId(id);

      res.status(StatusCodeEnum.OK_200).json({
        data: flashcardSets,
        message: "User flashcard sets retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default FlashcardSetController;
