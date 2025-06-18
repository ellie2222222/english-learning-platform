import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import { ITestService } from "../interfaces/services/ITestService";
import TestService from "../services/TestService";

@Service()
class TestController {
  constructor(
    @Inject(() => TestService)
    private testService: ITestService
  ) {}

  createTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { lessonIds, name, description, totalQuestions } = req.body;
      const test = await this.testService.createTest(
        name,
        lessonIds,
        description,
        totalQuestions
      );
      res.status(StatusCodeEnum.Created_201).json({
        test,
        message: "Test created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { lessonIds, name, description, totalQuestions } = req.body;
      const test = await this.testService.updateTest(
        id,
        lessonIds,
        name,
        description,
        totalQuestions
      );
      res.status(StatusCodeEnum.OK_200).json({
        test,
        message: "Test updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const test = await this.testService.deleteTest(id);
      res.status(StatusCodeEnum.OK_200).json({
        test,
        message: "Test deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getTestById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const test = await this.testService.getTestById(id);
      res.status(StatusCodeEnum.OK_200).json({
        test,
        message: "Test retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getTests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, size, order, sortBy } = req.query;
      const tests = await this.testService.getTests(
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
        },
        id
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...tests,
        message: "Tests retrieved successfully",
      });
    } catch (error) {
      next(error);
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
      const tests = await this.testService.getTestsByLessonId(id, {
        page: page ? parseInt(page as string) : 1,
        size: size ? parseInt(size as string) : 10,
        order: order as OrderType,
        sortBy: sortBy as SortByType,
      });
      res.status(StatusCodeEnum.OK_200).json({
        ...tests,
        message: "Tests retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TestController;
