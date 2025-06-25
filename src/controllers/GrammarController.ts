import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import GrammarService from "../services/GrammarService";
import { IGrammarService } from "../interfaces/services/IGrammarService";

@Service()
class GrammarController {
  constructor(
    @Inject(() => GrammarService)
    private grammarService: IGrammarService
  ) {}

  createGrammar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { lessonId, title, structure, example, explanation, order } =
        req.body;

      const grammar = await this.grammarService.createGrammar(
        lessonId,
        title,
        structure,
        example,
        explanation,
        order
      );
      res.status(StatusCodeEnum.Created_201).json({
        grammar,
        message: "Grammar created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateGrammar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { lessonId, title, structure, example, explanation, order } =
        req.body;
      const grammar = await this.grammarService.updateGrammar(
        id,
        lessonId,
        title,
        structure,
        example,
        explanation,
        order
      );
      res.status(StatusCodeEnum.OK_200).json({
        grammar,
        message: "Grammar updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteGrammar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const grammar = await this.grammarService.deleteGrammar(id);
      res.status(StatusCodeEnum.OK_200).json({
        grammar,
        message: "Grammar deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getGrammarById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userInfo.userId;
      const grammar = await this.grammarService.getGrammarById(id, userId);
      res.status(StatusCodeEnum.OK_200).json({
        grammar,
        message: "Grammar retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getGrammars = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy } = req.query;
      const userId = req.userInfo.userId;
      const grammars = await this.grammarService.getGrammars(
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
        },
        userId
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...grammars,
        message: "Grammars retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getGrammarsByLessonId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userInfo.userId;
      const { page, size, order, sortBy } = req.query;
      const grammars = await this.grammarService.getGrammarsByLessonId(
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
        ...grammars,
        message: "Grammars retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default GrammarController;
