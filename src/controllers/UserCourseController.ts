import { Inject, Service } from "typedi"; 
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery"; 
import { IUserCourseService } from "../interfaces/services/IUserCourseService";
import UserCourseService from "../services/UserCourseService";

@Service()
class UserCourseController {
  constructor(
    @Inject(() => UserCourseService)
    private userCourseService: IUserCourseService
  ) {}

  createUserCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, lessonId, currentOrder, status  } = req.body;
      const userCourse = await this.userCourseService.createUserCourse(userId, lessonId, currentOrder, status);
      res.status(StatusCodeEnum.Created_201).json({
        userCourse,
        message: "User lesson created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userCourseId } = req.params;
      const { status } = req.body;
      const userCourse = await this.userCourseService.updateUserCourse(userCourseId, status);
      res.status(StatusCodeEnum.OK_200).json({
        userCourse,
        message: "User lesson updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUserCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userCourseId } = req.params;
      const userCourse = await this.userCourseService.deleteUserCourse(userCourseId);
      res.status(StatusCodeEnum.OK_200).json({
        userCourse,
        message: "User lesson deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userCourseId } = req.params;
      const userCourse = await this.userCourseService.getUserCourseById(userCourseId);
      res.status(StatusCodeEnum.OK_200).json({
        userCourse,
        message: "User lesson retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserCoursesByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { page, size, order, sortBy } = req.query;
      const userCourses = await this.userCourseService.getUserCoursesByUserId(
        userId,
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
        },
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...userCourses,
        message: "User lessons retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserCourseController;