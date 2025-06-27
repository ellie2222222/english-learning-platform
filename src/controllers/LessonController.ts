import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import LessonService from "../services/LessonService";
import { ILessonService } from "../interfaces/services/ILessonService";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

@Service()
class LessonController {
  constructor(
    @Inject(() => LessonService)
    private lessonService: ILessonService
  ) {}

  createLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { courseId, name, description } = req.body;
      const lesson = await this.lessonService.createLesson(
        courseId,
        name,
        description,
        [
          { for: LessonTrackingType.EXERCISE, amount: 0 },
          { for: LessonTrackingType.VOCABULARY, amount: 0 },
          { for: LessonTrackingType.GRAMMAR, amount: 0 },
        ]
      );
      res.status(StatusCodeEnum.Created_201).json({
        lesson,
        message: "Lesson created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { courseId, name, description } = req.body;
      const lesson = await this.lessonService.updateLesson(
        id,
        courseId,
        name,
        description
      );
      res.status(StatusCodeEnum.OK_200).json({
        lesson,
        message: "Lesson updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const lesson = await this.lessonService.deleteLesson(id);
      res.status(StatusCodeEnum.OK_200).json({
        lesson,
        message: "Lesson deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getLessonById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userInfo.userId;
      const lesson = await this.lessonService.getLessonById(id, userId);
      res.status(StatusCodeEnum.OK_200).json({
        lesson,
        message: "Lesson retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getLessons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy } = req.query;
      const lessons = await this.lessonService.getLessons({
        page: page ? parseInt(page as string) : 1,
        size: size ? parseInt(size as string) : 10,
        order: order as OrderType,
        sortBy: sortBy as SortByType,
      });
      res.status(StatusCodeEnum.OK_200).json({
        ...lessons,
        message: "Lessons retrieved successfully",
      });
    } catch (error) {
      next(error);
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
      const lessons = await this.lessonService.getLessonsByCourseId(id, {
        page: page ? parseInt(page as string) : 1,
        size: size ? parseInt(size as string) : 10,
        order: order as OrderType,
        sortBy: sortBy as SortByType,
      });
      res.status(StatusCodeEnum.OK_200).json({
        ...lessons,
        message: "Lessons retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default LessonController;
