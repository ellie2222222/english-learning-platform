import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import {
  UserCourseStatus,
  UserCourseStatusType,
} from "../enums/UserCourseStatus";

class UserCourseDto {
  private validateObjectId = (id: string): void => {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }
  };

  private validateLessonFinished = (lessonFinished: number): void => {
    if (
      lessonFinished !== undefined &&
      (isNaN(lessonFinished) || lessonFinished < 0)
    ) {
      throw new Error(
        "Lesson finished must be a number greater than or equal to 0"
      );
    }
  };

  private validateAverageScore = (averageScore: number): void => {
    if (
      averageScore !== undefined &&
      averageScore !== null &&
      (isNaN(averageScore) || averageScore < 0 || averageScore > 100)
    ) {
      throw new Error(
        "Average score must be a number between 0 and 100 or null"
      );
    }
  };

  private validateStatus = (status: string): void => {
    if (
      status &&
      !Object.values(UserCourseStatus).includes(status as UserCourseStatusType)
    ) {
      throw new Error("Invalid status");
    }
  };

  createUserCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, courseId, lessonFinished, averageScore, status } =
        req.body;

      if (!userId || !courseId) {
        throw new Error(
          "Missing required fields: userId and courseId are required"
        );
      }

      this.validateObjectId(userId);
      this.validateObjectId(courseId);
      this.validateLessonFinished(lessonFinished);
      this.validateAverageScore(averageScore);
      this.validateStatus(status);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  updateUserCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { lessonFinished, averageScore, status } = req.body;

      this.validateObjectId(id);
      this.validateLessonFinished(lessonFinished);
      this.validateAverageScore(averageScore);
      this.validateStatus(status);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  deleteUserCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userCourseId } = req.params;
      this.validateObjectId(userCourseId);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getUserCourseById = async (
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

  getUserCoursesByUserId = async (
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

  getUserCourseByCourseId = async (
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
}

export default UserCourseDto;
