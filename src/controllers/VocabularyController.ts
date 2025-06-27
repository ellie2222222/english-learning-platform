import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import VocabularyService from "../services/VocabularyService";
import { IVocabularyService } from "../interfaces/services/IVocabularyService";
import { formatPathSingle, uploadToCloudinary } from "../utils/fileUtils";

@Service()
class VocabularyController {
  constructor(
    @Inject(() => VocabularyService)
    private vocabularyService: IVocabularyService
  ) {}

  createVocabulary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { lessonId, englishContent, vietnameseContent } = req.body;
      const imageFile = req.file as Express.Multer.File | undefined;

      let imageUrl: string;
      if (process.env.STORAGE_TYPE === "cloudinary") {
        imageUrl = await uploadToCloudinary(imageFile!);
      } else {
        imageUrl = formatPathSingle(imageFile!);
      }

      const vocabulary = await this.vocabularyService.createVocabulary(
        lessonId,
        englishContent,
        vietnameseContent,
        imageUrl
      );
      res.status(StatusCodeEnum.Created_201).json({
        vocabulary,
        message: "Vocabulary created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateVocabulary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { lessonId, englishContent, vietnameseContent } = req.body;
      const imageFile = req.file as Express.Multer.File | undefined;

      // Image is validated as required in VocabularyDto, so req.file should exist
      let imageUrl: string | undefined;
      if (imageFile) {
        if (process.env.STORAGE_TYPE === "cloudinary") {
          imageUrl = await uploadToCloudinary(imageFile);
        } else {
          imageUrl = formatPathSingle(imageFile);
        }
      }

      const vocabulary = await this.vocabularyService.updateVocabulary(
        id,
        lessonId,
        englishContent,
        vietnameseContent,
        imageUrl
      );
      res.status(StatusCodeEnum.OK_200).json({
        vocabulary,
        message: "Vocabulary updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVocabulary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const vocabulary = await this.vocabularyService.deleteVocabulary(id);
      res.status(StatusCodeEnum.OK_200).json({
        vocabulary,
        message: "Vocabulary deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getVocabularyById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userInfo.userId;
      const vocabulary = await this.vocabularyService.getVocabularyById(
        id,
        userId
      );
      res.status(StatusCodeEnum.OK_200).json({
        vocabulary,
        message: "Vocabulary retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getVocabularies = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy } = req.query;
      const userId = req.userInfo.userId;
      const vocabularies = await this.vocabularyService.getVocabularies(
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
        },
        userId
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...vocabularies,
        message: "Vocabularies retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getVocabulariesByLessonId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, size, order, sortBy } = req.query;
      const userId = req.userInfo.userId;
      const vocabularies =
        await this.vocabularyService.getVocabulariesByLessonId(
          id,
          {
            page: page ? parseInt(page as string) : 1,
            size: size ? parseInt(size as string) : 10,
            order: order as OrderType,
            sortBy: sortBy as SortByType,
          },
          userId
        );
      res.status(StatusCodeEnum.OK_200).json({
        ...vocabularies,
        message: "Vocabularies retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default VocabularyController;
