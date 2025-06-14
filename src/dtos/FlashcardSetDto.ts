import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import mongoose from "mongoose";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class FlashcardSetDto {
  createFlashcardSet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        throw new Error("Missing required field");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
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

      if (!id) {
        throw new Error("Flashcard set ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid flashcard set ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  deleteFlashcardSet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Flashcard set ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid flashcard set ID");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  getFlashcardSets = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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

  getFlashcardSet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Flashcard set ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid flashcard set ID");
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

export default FlashcardSetDto;
