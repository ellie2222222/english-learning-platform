import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import UserLessonService from "../services/UserLessonService";
import { IUserLessonService } from "../interfaces/services/IUserLessonService";
import { UserLessonStatus } from "../enums/UserLessonStatus";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

@Service()
class UserLessonController {
  constructor(
    @Inject(() => UserLessonService)
    private userLessonService: IUserLessonService
  ) {}

  createUserLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, lessonId } = req.body;
      const userLesson = await this.userLessonService.createUserLesson(
        userId,
        lessonId,
        [
          {
            for: LessonTrackingType.EXERCISE,
            order: 0,
          },
          {
            for: LessonTrackingType.GRAMMAR,
            order: 0,
          },
          {
            for: LessonTrackingType.VOCABULARY,
            order: 0,
          },
        ], // Default currentOrder to 0
        UserLessonStatus.ONGOING // Default status to ONGOING
      );
      res.status(StatusCodeEnum.Created_201).json({
        userLesson,
        message: "User lesson created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.userInfo.userId;
      const userLesson = await this.userLessonService.updateUserLesson(
        id,
        userId,
        status
      );
      res.status(StatusCodeEnum.OK_200).json({
        userLesson,
        message: "User lesson updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUserLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userLesson = await this.userLessonService.deleteUserLesson(id);
      res.status(StatusCodeEnum.OK_200).json({
        userLesson,
        message: "User lesson deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserLessonById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userLesson = await this.userLessonService.getUserLessonById(id);
      res.status(StatusCodeEnum.OK_200).json({
        userLesson,
        message: "User lesson retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserLessonsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, size, order, sortBy } = req.query;
      const userLessons = await this.userLessonService.getUserLessonsByUserId(
        id,
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
        }
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...userLessons,
        message: "User lessons retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserLessonByLessonId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userInfo.userId;

      const userLesson = await this.userLessonService.getUserLessonByLessonId(
        id,
        userId
      );

      res.status(StatusCodeEnum.OK_200).json({
        userLesson: userLesson,
        message: "User lesson retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserLessonController;
