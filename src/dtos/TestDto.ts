import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class TestDto {
  private validateObjectId = (id: string): void => {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
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

  createTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, description, order, lessonIds, totalQuestions } = req.body;

      if (!name || !lessonIds || !totalQuestions) {
        throw new Error(
          "Missing required fields:  name, length, lessonIds, and totalQuestions are required"
        );
      }

      this.validateName(name);
      this.validateDescription(description);
      this.validateLength(totalQuestions);
      this.validateOrder(order);
      lessonIds.forEach((lessonId: string) => this.validateObjectId(lessonId));
      if (isNaN(totalQuestions) || totalQuestions < 0) {
        throw new Error(
          "Total questions must be a number greater than or equal to 0"
        );
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  updateTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, length, order, lessonIds, totalQuestions } =
        req.body;

      this.validateObjectId(id);
      if (name) this.validateName(name);
      if (description) this.validateDescription(description);
      this.validateLength(length);
      this.validateOrder(order);
      if (lessonIds)
        lessonIds.forEach((lessonId: string) =>
          this.validateObjectId(lessonId)
        );
      if (
        totalQuestions !== undefined &&
        (isNaN(totalQuestions) || totalQuestions < 0)
      ) {
        throw new Error(
          "Total questions must be a number greater than or equal to 0"
        );
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  deleteTest = async (
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

  getTestById = async (
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

  getTests = async (
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

  getTestsByLessonId = async (
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

  getTestsByUserId = async (
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

  submitTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, answers } = req.body;
 
      this.validateObjectId(id);
 
      if (!userId || !answers) {
        throw new Error(
          "Missing required fields: userId, answers, and description are required"
        );
      }
 
      this.validateObjectId(userId);  
 
      if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error("Please provide at least one answer.");
      }

      answers.forEach((answer: any, index: number) => {
        if (!answer.exerciseId || !answer.selectedAnswers) {
          throw new Error(`Answer #${index + 1} is missing required information.`);
        }

        this.validateObjectId(answer.exerciseId);

        if (!Array.isArray(answer.selectedAnswers) || answer.selectedAnswers.length === 0) {
          throw new Error(`Please select at least one answer for question #${index + 1}.`);
        }

        answer.selectedAnswers = answer.selectedAnswers
          .map((ans: any) => {
            if (typeof ans !== "string") return "";

            return ans.replace(/\s[^\w\s]$/, "").trim();
          })
          .filter((ans: string) => ans.length > 0);
      });

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };
}

export default TestDto;
