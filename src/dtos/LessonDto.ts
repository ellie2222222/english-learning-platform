import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class LessonDto {
  private validateObjectId = (lessonId: string): void => {
    if (!lessonId) {
      throw new Error("ID is required");
    }
    if (!mongoose.isValidObjectId(lessonId)) {
      throw new Error("Invalid ID");
    }
  };

  private validateName = (name: string): void => {
    if (name && name.length > 100) {
      throw new Error("Name must not exceed 100 characters");
    }
  };

  private validateDescription = (description: string): void => {
    if (description && description.length > 2000) {
      throw new Error("Description must not exceed 2000 characters");
    }
  };

  private validateLength = (length: number): void => {
    if (length !== undefined && (isNaN(length) || length <= 0)) {
      throw new Error("Length must be a number greater than 0");
    }
  };

  private validateOrder = (order: number): void => {
    if (order !== undefined && (isNaN(order) || order < 0)) {
      throw new Error("Order must be a number greater than or equal to 0");
    }
  };

  createLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log(req.body);
      const { courseId, name, description } = req.body;

      if (!courseId || !name) {
        throw new Error(
          "Missing required fields: courseId, name, and length are required"
        );
      }

      this.validateObjectId(courseId);
      this.validateName(name);
      this.validateDescription(description);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  updateLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const { name, description } = req.body;

      this.validateObjectId(id);

      if (name) this.validateName(name);
      if (description) this.validateDescription(description);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  deleteLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

  getLessonById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

  getLessons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy } = req.query;

      if (
        page &&
        (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)
      ) {
        throw new Error("Invalid page number");
      }
      if (
        size &&
        (isNaN(parseInt(size as string)) || parseInt(size as string) < 1)
      ) {
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

  getLessonsByCourseId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, size, order, sortBy } = req.query;

      this.validateObjectId(id);

      if (
        page &&
        (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)
      ) {
        throw new Error("Invalid page number");
      }
      if (
        size &&
        (isNaN(parseInt(size as string)) || parseInt(size as string) < 1)
      ) {
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

export default LessonDto;
