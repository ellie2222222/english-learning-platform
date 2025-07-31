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
import UserMembershipModel from "../models/UserMembershipModel";
import { UserLessonStatus } from "../enums/UserLessonStatus";
import { ResourceType } from "../enums/ResourceType";
import CourseModel from "../models/CourseModel";
import UserModel from "../models/UserModel";
import { CourseTypeEnum } from "../enums/CourseTypeEnum";
import { MembershipTierEnum, MEMBERSHIP_TIERS } from "../enums/MembershipTierEnum";
import { ILesson } from "../interfaces/models/ILesson";
import { IGrammar } from "../interfaces/models/IGrammar";
import { IExercise } from "../interfaces/models/IExercise";
import { IVocabulary } from "../interfaces/models/IVocabulary";
import { ITest } from "../interfaces/models/ITest";

interface CourseTypeOnly {
  _id: mongoose.Types.ObjectId;
  type: string;
}

const MembershipAccessLimitMiddleware = (resourceType: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

      let courseType;
      const user = await UserModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      });

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (user.role === UserEnum.ADMIN) {
        next();
      }
      switch (resourceType) {
        case ResourceType.COURSE: {
          courseType = await CourseModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          })
            .lean()
            .select("type");
          if (!courseType) break;

          break;
        }

        case ResourceType.LESSON: {
          const lesson: ILesson | null = await LessonModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          })
            .populate({
              path: "courseId",
              select: "type",
            })
            .lean();
          if (!lesson) break;
          courseType = lesson.courseId;
          if (!courseType) break;

          break;
        }

        case ResourceType.GRAMMAR: {
          const grammar: IGrammar | null = await GrammarModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          })
            .populate({
              path: "lessonId",
              populate: { path: "courseId", select: "type" },
            })
            .lean();
          if (!grammar) break;

          courseType = (grammar.lessonId as ILesson).courseId;
          break;
        }

        case ResourceType.EXERCISE: {
          const exercise: IExercise | null = await ExerciseModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          })
            .populate({
              path: "lessonId",
              populate: { path: "courseId", select: "type" },
            })
            .lean();
          if (!exercise) break;

          courseType = (exercise.lessonId as ILesson).courseId;
          break;
        }

        case ResourceType.VOCABULARY: {
          const vocab: IVocabulary | null = await VocabularyModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          })
            .populate({
              path: "lessonId",
              populate: { path: "courseId", select: "type" },
            })
            .lean();
          if (!vocab) break;

          courseType = (vocab.lessonId as ILesson).courseId;
          break;
        }

        case ResourceType.TEST: {
          const test: ITest | null = await TestModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            isDeleted: false,
          })
            .populate({ path: "courseId", select: "type" })
            .lean();
          if (!test) break;

          courseType = test.courseId;
          break;
        }

        default:
          break;
      }

      if (!courseType || courseType === undefined || courseType == null) {
        res
          .status(StatusCodeEnum.NotFound_404)
          .json({ message: "Course not found" });
        return;
      }

      if (
        courseType &&
        (courseType as CourseTypeOnly).type === CourseTypeEnum.MEMBERSHIP
      ) {
        // Check user's current membership tier
        const userMembership = await UserMembershipModel.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          isActive: true,
          endDate: { $gte: new Date() },
          isDeleted: { $ne: true },
        });

        if (!userMembership) {
          res.status(StatusCodeEnum.PaymentRequired_402).json({
            message: "Premium membership is required for this resource",
            requiredTier: MembershipTierEnum.PREMIUM,
            currentTier: MembershipTierEnum.FREE,
          });
          return;
        }

        // Check if user's tier has access to premium courses
        const tierConfig = MEMBERSHIP_TIERS[userMembership.tier as MembershipTierEnum];
        if (!tierConfig.features.premiumCourses) {
          res.status(StatusCodeEnum.PaymentRequired_402).json({
            message: "Higher membership tier required for premium courses",
            requiredTier: MembershipTierEnum.PREMIUM,
            currentTier: userMembership.tier,
          });
          return;
        }
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

const GenericResourceAccessMiddleware = (resourceType: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

export { GenericResourceAccessMiddleware, MembershipAccessLimitMiddleware };
