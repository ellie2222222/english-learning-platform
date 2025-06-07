import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import { CourseTypeEnum } from "../enums/CourseTypeEnum";
import { CourseLevelEnum } from "../enums/CourseLevelEnum";

class CourseDto {
  private validateObjectId = (courseId: string): void => {
    if (!courseId) {
      throw new Error("Course ID is required");
    }
    if (!mongoose.isValidObjectId(courseId)) {
      throw new Error("Invalid course ID");
    }
  };

  private validateCourseType = (type: string): void => {
    if (type && !Object.values(CourseTypeEnum).includes(type)) {
      throw new Error(`Invalid course type. Must be one of: ${Object.values(CourseTypeEnum).join(", ")}`);
    }
  };

  private validateName = (name: string): void => {
    if (name && name.length > 100) {
      throw new Error("Name must not exceed 100 characters");
    }
  };

  private validateDescription = (description: string): void => {
    if (description && description.length > 2000) {
      throw new Error("Description must not exceed 2000 characters");
    }
  };

  private validateLevel = (level: string): void => {
    if (level && !Object.values(CourseLevelEnum).includes(level)) {
      throw new Error(`Invalid level. Must be one of: ${Object.values(CourseLevelEnum).join(", ")}`);
    }
  };

  createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, type, level, totalLessons } = req.body;

      if (!name || !type || !level) {
        throw new Error("Missing required fields: name, type, and level are required");
      }

      this.validateName(name);
      this.validateDescription(description);
      this.validateCourseType(type);
      this.validateLevel(level);

      if (totalLessons !== undefined && (isNaN(totalLessons) || totalLessons < 1)) {
        throw new Error("Total lessons must be a number greater than 0");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const { name, description, type, level, totalLessons } = req.body;

      this.validateObjectId(courseId);
      if (name) this.validateName(name);
      if (description) this.validateDescription(description);
      this.validateCourseType(type);
      if (level) this.validateLevel(level);

      if (totalLessons !== undefined && (isNaN(totalLessons) || totalLessons < 1)) {
        throw new Error("Total lessons must be a number greater than 0");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      this.validateObjectId(courseId);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      this.validateObjectId(courseId);
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, size, order, sortBy, type } = req.query;

      if (page && (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)) {
        throw new Error("Invalid page number");
      }
      if (size && (isNaN(parseInt(size as string)) || parseInt(size as string) < 1)) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }
      this.validateCourseType(type as string);

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };
}

export default CourseDto;