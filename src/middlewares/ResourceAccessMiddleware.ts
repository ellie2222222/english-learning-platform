import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserCourseModel from "../models/UserCourseModel";
import UserLessonModel from "../models/UserLessonModel";
import LessonModel from "../models/LessonModel";
import TestModel from "../models/TestModel";
import UserEnum from "../enums/UserEnum";
import VocabularyModel from "../models/VocabularyModel";
import ExerciseModel from "../models/ExerciseModel";
import GrammarModel from "../models/GrammarModel";
import { UserLessonStatus } from "../enums/UserLessonStatus";
import { ResourceType } from "../enums/ResourceType";
import CourseModel from "../models/CourseModel";

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

const GenericResourceAccessMiddleware = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const resourceId = req.params.id;

      let hasAccess = false;

      switch (resourceType) {
        case ResourceType.COURSE: {
          const course = await CourseModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          });
          if (!course) break;
          const userCourse = await UserCourseModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: resourceId,
            isDeleted: false,
          });
          hasAccess = !!userCourse;

          break;
        }

        case ResourceType.LESSON: {
          const lesson = await LessonModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          });
          if (!lesson) break;
          const userCourse = await UserCourseModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: lesson.courseId,
            isDeleted: false,
          });
          hasAccess = !!userCourse;

          break;
        }

        case ResourceType.GRAMMAR: {
          const grammar = await GrammarModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          });
          if (!grammar) break;
          const userLesson = await UserLessonModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            lessonId: grammar.lessonId,
            isDeleted: false,
          });
          hasAccess = !!userLesson;
          break;
        }

        case ResourceType.EXERCISE: {
          const exercise = await ExerciseModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          });
          if (!exercise) break;
          const userLesson = await UserLessonModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            lessonId: exercise.lessonId,
            isDeleted: false,
          });
          hasAccess = !!userLesson;
          break;
        }

        case ResourceType.VOCABULARY: {
          const vocab = await VocabularyModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          });
          if (!vocab) break;
          const userLesson = await UserLessonModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            lessonId: vocab.lessonId,
            isDeleted: false,
          });
          hasAccess = !!userLesson;
          break;
        }

        case ResourceType.TEST: {
          const test = await TestModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          });
          if (!test) break;
          // For test, require that the user has completed all userLessons for lessonIds in the test
          const userLessons = await UserLessonModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            lessonId: { $in: test.lessonIds },
            isDeleted: false,
            status: UserLessonStatus.COMPLETED,
          });
          hasAccess = userLessons.length === test.lessonIds.length;
          break;
        }

        default:
          break;
      }

      if (!hasAccess) {
        res
          .status(StatusCodeEnum.Forbidden_403)
          .json({ message: "You do not have access to this resource" });
        return;
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
};

export {
  CourseResourceAccessMiddleware,
  LessonResourceAccessMiddleware,
  GenericResourceAccessMiddleware,
};
