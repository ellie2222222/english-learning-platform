import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import {
  UserTestStatusEnum,
  UserTestStatusEnumType,
} from "../enums/UserTestStatusEnum";

class UserTestDto {
  private validateObjectId = (id: string): void => {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }
  };

  private validateDescription = (description: string): void => {
    if (description && description.length > 2000) {
      throw new Error("Description must not exceed 2000 characters");
    }
  };

  private validateAttemptNo = (attemptNo: number): void => {
    if (attemptNo !== undefined && (isNaN(attemptNo) || attemptNo <= 0)) {
      throw new Error("Attempt number must be a number greater than 0");
    }
  };

  private validateScore = (score: number): void => {
    if (score !== undefined && (isNaN(score) || score < 0)) {
      throw new Error("Score must be a number greater than or equal to 0");
    }
  };

  private validateStatus = (status: string): void => {
    if (
      status &&
      !Object.values(UserTestStatusEnum).includes(
        status as UserTestStatusEnumType
      )
    ) {
      throw new Error("Invalid status");
    }
  };

  createUserTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      //remove attemptNo, score,status,description, add array of object informat : "id", "answer" => calculate score, status, description
      const { testId, userId, attemptNo, score, status, description } =
        req.body;

      if (!testId || !userId || !attemptNo || score === undefined || !status) {
        throw new Error(
          "Missing required fields: testId, userId, attemptNo, score, and status are required"
        );
      }

      this.validateObjectId(testId);
      this.validateObjectId(userId);
      this.validateAttemptNo(attemptNo);
      this.validateScore(score);
      this.validateStatus(status);
      this.validateDescription(description);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getUserTestById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userTestId } = req.params;
      this.validateObjectId(userTestId);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getUserTestsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { page, size, order, sortBy } = req.query;

      this.validateObjectId(userId);

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

export default UserTestDto;
