import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import UserTestService from "../services/UserTestService";
import { IUserTestService } from "../interfaces/services/IUserTestService";

@Service()
class UserTestController {
  constructor(
    @Inject(() => UserTestService)
    private testService: IUserTestService
  ) {}

  createUserTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { testId, userId, attemptNo, score, status, description } =
        req.body;
      const userTest = await this.testService.createUserTest(
        testId,
        userId,
        attemptNo,
        score,
        status,
        description
      );
      res.status(StatusCodeEnum.Created_201).json({
        userTest,
        message: "User test created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserTestById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userTestId } = req.params;
      const userTest = await this.testService.getUserTestById(userTestId);
      res.status(StatusCodeEnum.OK_200).json({
        userTest,
        message: "User test retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserTestsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, size, order, sortBy } = req.query;
      const userTests = await this.testService.getUserTestsByUserId(id, {
        page: page ? parseInt(page as string) : 1,
        size: size ? parseInt(size as string) : 10,
        order: order as OrderType,
        sortBy: sortBy as SortByType,
      });
      res.status(StatusCodeEnum.OK_200).json({
        ...userTests,
        message: "User tests retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserTestsByTestId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, size, order, sortBy } = req.query;
      const userTests = await this.testService.getUserTestsByTestId(id, {
        page: page ? parseInt(page as string) : 1,
        size: size ? parseInt(size as string) : 10,
        order: order as OrderType,
        sortBy: sortBy as SortByType,
      });
      res.status(StatusCodeEnum.OK_200).json({
        ...userTests,
        message: "User tests retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserTestByTestId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const userTest = await this.testService.getUserTestByTestId(
        id,
        requesterId
      );

      res.status(StatusCodeEnum.OK_200).json({
        userTest,
        message: "User test retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserTestController;
