import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class VocabularyDto {
  private validateObjectId = (id: string): void => {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }
  };

  private validateEnglishContent = (englishContent: string): void => {
    if (!englishContent) {
      throw new Error("English content is required");
    }
    if (englishContent.length > 100) {
      throw new Error("English content must not exceed 100 characters");
    }
  };

  private validateVietnameseContent = (vietnameseContent: string): void => {
    if (!vietnameseContent) {
      throw new Error("Vietnamese content is required");
    }
    if (vietnameseContent.length > 100) {
      throw new Error("Vietnamese content must not exceed 100 characters");
    }
  };

  private validateImage = (req: Request, isRequired: boolean): void => {
    if (isRequired && !req.file) {
      throw new Error("Image file is required");
    }
    if (req.file && req.file.path.length > 500) {
      throw new Error("Image URL must not exceed 500 characters");
    }
  };

  private validateOrder = (order: number): void => {
    if (order !== undefined && (isNaN(order) || order < 0)) {
      throw new Error("Order must be a number greater than or equal to 0");
    }
  };

  createVocabulary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId, englishContent, vietnameseContent, order } = req.body;

      if (!lessonId || !englishContent || !vietnameseContent || order === undefined) {
        throw new Error("Missing required fields: lessonId, englishContent, vietnameseContent, and order are required");
      }

      this.validateObjectId(lessonId);
      this.validateEnglishContent(englishContent);
      this.validateVietnameseContent(vietnameseContent);
      this.validateImage(req, true);  
      this.validateOrder(order);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  updateVocabulary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vocabularyId } = req.params;
      const { lessonId, englishContent, vietnameseContent, order } = req.body;

      this.validateObjectId(vocabularyId);
      if (lessonId) this.validateObjectId(lessonId);
      if (englishContent) this.validateEnglishContent(englishContent);
      if (vietnameseContent) this.validateVietnameseContent(vietnameseContent);
      this.validateImage(req, true); 
      this.validateOrder(order);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  deleteVocabulary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vocabularyId } = req.params;
      this.validateObjectId(vocabularyId);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getVocabularyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vocabularyId } = req.params;
      this.validateObjectId(vocabularyId);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getVocabularies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  getVocabulariesByLessonId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const { page, size, order, sortBy } = req.query;

      this.validateObjectId(lessonId);

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

export default VocabularyDto;