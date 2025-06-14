import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import mongoose from "mongoose";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class FlashcardDto {
  createFlashcard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { englishContent, vietnameseContent, flashcardSetId } = req.body;
      if (!englishContent || !vietnameseContent || !flashcardSetId) {
        throw new Error("Missing required fields");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  updateFlashcard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Flashcard ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid Flashcard ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  deleteFlashcard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Flashcard ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid Flashcard ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  getFlashcard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Flashcard ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid Flashcard ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy, userId } = req.query;

      if (page && parseInt(page as string) < 1) {
        throw new Error("Invalid page number");
      }
      if (size && parseInt(size as string) < 1) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }
      if (userId && !mongoose.isValidObjectId(userId)) {
        throw new Error("Invalid user ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };
}

export default FlashcardDto;
