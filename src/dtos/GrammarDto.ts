import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class GrammarDto {
  private validateObjectId = (id: string): void => {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }
  };

  private validateTitle = (title: string): void => {
    if (!title) {
      throw new Error("Title is required");
    }
    if (title.length > 100) {
      throw new Error("Title must not exceed 100 characters");
    }
  };

  private validateStructure = (structure: string): void => {
    if (!structure) {
      throw new Error("Structure is required");
    }
    if (structure.length > 500) {
      throw new Error("Structure must not exceed 500 characters");
    }
  };

  private validateExample = (example: string): void => {
    if (example && example.length > 1000) {
      throw new Error("Example must not exceed 1000 characters");
    }
  };

  private validateExplanation = (explanation: string): void => {
    if (explanation && explanation.length > 2000) {
      throw new Error("Explanation must not exceed 2000 characters");
    }
  };

  private validateOrder = (order: number): void => {
    if (order !== undefined && (isNaN(order) || order < 0)) {
      throw new Error("Order must be a number greater than or equal to 0");
    }
  };

  createGrammar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId, title, structure, example, explanation, order } = req.body;

      if (!lessonId || !title || !structure || order === undefined) {
        throw new Error("Missing required fields: lessonId, title, structure, and order are required");
      }

      this.validateObjectId(lessonId);
      this.validateTitle(title);
      this.validateStructure(structure);
      this.validateExample(example);
      this.validateExplanation(explanation);
      this.validateOrder(order);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  updateGrammar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { lessonId, title, structure, example, explanation, order } = req.body;

      this.validateObjectId(id);
      if (lessonId) this.validateObjectId(lessonId);
      if (title) this.validateTitle(title);
      if (structure) this.validateStructure(structure);
      this.validateExample(example);
      this.validateExplanation(explanation);
      this.validateOrder(order);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  deleteGrammar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      this.validateObjectId(id);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getGrammarById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      this.validateObjectId(id);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getGrammars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, size, order, sortBy } = req.query;

      if (page && (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)) {
        throw new Error("Invalid page number");
      }
      if (size && (isNaN(parseInt(size as string)) || parseInt(size as string) < 1)) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getGrammarsByLessonId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, size, order, sortBy } = req.query;

      this.validateObjectId(id);

      if (page && (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)) {
        throw new Error("Invalid page number");
      }
      if (size && (isNaN(parseInt(size as string)) || parseInt(size as string) < 1)) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };
}

export default GrammarDto;