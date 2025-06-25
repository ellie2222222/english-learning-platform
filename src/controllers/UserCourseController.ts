import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import { IUserCourseService } from "../interfaces/services/IUserCourseService";
import UserCourseService from "../services/UserCourseService";
import { UserCourseStatus } from "../enums/UserCourseStatus";

@Service()
class UserCourseController {
  constructor(
    @Inject(() => UserCourseService)
    private userCourseService: IUserCourseService
  ) {}

  createUserCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, courseId } = req.body;
      const userCourse = await this.userCourseService.createUserCourse(
        userId,
        courseId,
        0, // Default currentOrder to 0
        UserCourseStatus.ONGOING // Default status to ONGOING
      );
      res.status(StatusCodeEnum.Created_201).json({
        userCourse,
        message: "User course created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userCourse = await this.userCourseService.updateUserCourse(
        id,
        status
      );
      res.status(StatusCodeEnum.OK_200).json({
        userCourse,
        message: "User course updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUserCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userCourse = await this.userCourseService.deleteUserCourse(id);
      res.status(StatusCodeEnum.OK_200).json({
        userCourse,
        message: "User course deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserCourseById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userCourse = await this.userCourseService.getUserCourseById(id);
      res.status(StatusCodeEnum.OK_200).json({
        userCourse,
        message: "User course retrieved successfully",
      });
    } catch (error) {
      next(error);
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
      const userCourses = await this.userCourseService.getUserCoursesByUserId(
        id,
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
        }
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...userCourses,
        message: "User courses retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserCourseController;
