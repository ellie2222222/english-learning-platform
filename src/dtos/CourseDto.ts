import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import { CourseTypeEnum } from "../enums/CourseTypeEnum";
import { CourseLevelEnum } from "../enums/CourseLevelEnum";

class CourseDto {
  private validateObjectId = (id: string): void => {
    if (!id) {
      throw new Error("Course ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid course ID");
    }
  };

  private validateCourseType = (type: string): void => {
    if (type && !Object.values(CourseTypeEnum).includes(type)) {
      throw new Error(
        `Invalid course type. Must be one of: ${Object.values(
          CourseTypeEnum
        ).join(", ")}`
      );
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
      throw new Error(
        `Invalid level. Must be one of: ${Object.values(CourseLevelEnum).join(
          ", "
        )}`
      );
    }
  };

  private validateImage = (req: Request, isRequired: boolean): void => {
    if (isRequired && !req.file) {
      throw new Error("Course cover image is required");
    }
    if (req.file && req.file.size > 2 * 1024 * 1024) {  // 2MB limit
      throw new Error("Image file size must not exceed 2MB");
    }
  };

  createCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, description, type, level } = req.body;

      if (!name || !type || !level) {
        throw new Error(
          "Missing required fields: name, type, and level are required"
        );
      }

      this.validateName(name);
      this.validateDescription(description);
      this.validateCourseType(type);
      this.validateLevel(level);
      this.validateImage(req, true);  // Pass the whole request object

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
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

      this.validateObjectId(id);
      if (name) this.validateName(name);
      if (description) this.validateDescription(description);
      if (type) this.validateCourseType(type);
      if (level) this.validateLevel(level);
      this.validateImage(req, false);  // Pass the whole request object, not required for update

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  deleteCourse = async (
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

  getCourseById = async (
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

  getCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy, type } = req.query;

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
