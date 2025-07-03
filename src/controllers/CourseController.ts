import { Inject, Service } from "typedi";
import CourseService from "../services/CourseService";
import { ICourseService } from "../interfaces/services/ICourseService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import { formatPathSingle, uploadToCloudinary } from "../utils/fileUtils";

@Service()
class CourseController {
  constructor(
    @Inject(() => CourseService)
    private courseService: ICourseService
  ) {}

  createCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, description, type, level } = req.body;
      const imageFile = req.file;

      let imageUrl: string | undefined;
      if (imageFile) {
        try {
          if (process.env.STORAGE_TYPE === "cloudinary") {
            imageUrl = await uploadToCloudinary(imageFile);
          } else {
            imageUrl = formatPathSingle(imageFile);
          }
        } catch (error) {
          throw new Error("Failed to process course cover image: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }

      const course = await this.courseService.createCourse(
        name,
        description,
        type,
        level,
        0,
        imageUrl
      );
      res.status(StatusCodeEnum.Created_201).json({
        course,
        message: "Course created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, type, level } = req.body;
      const imageFile = req.file;

      let imageUrl: string | undefined;
      if (imageFile) {
        try {
          if (process.env.STORAGE_TYPE === "cloudinary") {
            imageUrl = await uploadToCloudinary(imageFile);
          } else {
            imageUrl = formatPathSingle(imageFile);
          }
        } catch (error) {
          throw new Error("Failed to process course cover image: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }

      const course = await this.courseService.updateCourse(
        id,
        name,
        description,
        type,
        level,
        undefined,  // totalLessons is not updated through this endpoint
        imageUrl
      );
      res.status(StatusCodeEnum.OK_200).json({
        course,
        message: "Course updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const course = await this.courseService.deleteCourse(id);
      res.status(StatusCodeEnum.OK_200).json({
        course,
        message: "Course deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getCourseById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const course = await this.courseService.getCourseById(id);
      res.status(StatusCodeEnum.OK_200).json({
        course,
        message: "Course retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy, search, type } = req.query;
      const courses = await this.courseService.getCourses(
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
          search: search as string,
        },
        type as string
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...courses,
        message: "Courses retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getCourseDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const courseDetails = await this.courseService.getCourseDetails(id);
      res.status(StatusCodeEnum.OK_200).json({
        course: courseDetails,
        message: "Course details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CourseController;
