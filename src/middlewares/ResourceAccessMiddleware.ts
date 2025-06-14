import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserCourseModel from "../models/UserCourseModel";
import UserLessonModel from "../models/UserLessonModel";
import LessonModel from "../models/LessonModel";
import TestModel from "../models/TestModel";
import UserEnum from "../enums/UserEnum";

const CourseResourceAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userInfo || !req.userInfo.userId) {
      throw new CustomException(
        StatusCodeEnum.Unauthorized_401,
        "User not authenticated"
      );
    }

    if (req.userInfo.role === UserEnum.ADMIN) {
      return next();
    }

    const userId = req.userInfo.userId;
    const lessonId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw new CustomException(
        StatusCodeEnum.BadRequest_400,
        "Invalid lesson ID"
      );
    }

    const lesson = await LessonModel.findOne({
      _id: new mongoose.Types.ObjectId(lessonId),
      isDeleted: false,
    }).exec();

    if (!lesson) {
      throw new CustomException(
        StatusCodeEnum.NotFound_404,
        "Lesson not found"
      );
    }

    const userCourse = await UserCourseModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      courseId: lesson.courseId,
      isDeleted: false,
    }).exec();

    if (!userCourse) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "You are not enrolled in the course for this lesson"
      );
    }

    next();
  } catch (error) {
    if (error instanceof CustomException) {
      res.status(error.code).json({
        code: error.code,
        message: error.message,
      });
    } else {
      res.status(StatusCodeEnum.InternalServerError_500).json({
        code: StatusCodeEnum.InternalServerError_500,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }
};

const LessonResourceAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userInfo || !req.userInfo.userId) {
      throw new CustomException(
        StatusCodeEnum.Unauthorized_401,
        "User not authenticated"
      );
    }

    if (req.userInfo.role === UserEnum.ADMIN) {
      return next();
    }

    const userId = req.userInfo.userId;
    const testId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      throw new CustomException(
        StatusCodeEnum.BadRequest_400,
        "Invalid test ID"
      );
    }

    const test = await TestModel.findOne({
      _id: new mongoose.Types.ObjectId(testId),
      isDeleted: false,
    }).exec();

    if (!test) {
      throw new CustomException(StatusCodeEnum.NotFound_404, "Test not found");
    }

    const userLesson = await UserLessonModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: { $in: test.lessonIds },
      isDeleted: false,
    }).exec();

    if (!userLesson) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "You do not have access to the lesson required for this test"
      );
    }

    next();
  } catch (error) {
    if (error instanceof CustomException) {
      res.status(error.code).json({
        code: error.code,
        message: error.message,
      });
    } else {
      res.status(StatusCodeEnum.InternalServerError_500).json({
        code: StatusCodeEnum.InternalServerError_500,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }
};

export { CourseResourceAccessMiddleware, LessonResourceAccessMiddleware };
