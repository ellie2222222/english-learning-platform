import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserModel from "../models/UserModel";
import CourseModel from "../models/CourseModel";
import UserCourseModel from "../models/UserCourseModel";
import UserLessonModel from "../models/UserLessonModel";
import LessonModel from "../models/LessonModel";
import TestModel from "../models/TestModel";
import ExerciseModel from "../models/ExerciseModel";
import GrammarModel from "../models/GrammarModel";
import VocabularyModel from "../models/VocabularyModel";
import UserMembershipModel from "../models/UserMembershipModel";
import UserTestModel from "../models/UserTestModel";
import UserEnum from "../enums/UserEnum";
import { CourseTypeEnum } from "../enums/CourseTypeEnum";
import { MembershipTierEnum, MEMBERSHIP_TIERS } from "../enums/MembershipTierEnum";
import { UserCourseStatus } from "../enums/UserCourseStatus";
import { UserLessonStatus } from "../enums/UserLessonStatus";

export enum ResourceType {
  COURSE = "course",
  LESSON = "lesson",
  TEST = "test",
  EXERCISE = "exercise",
  GRAMMAR = "grammar",
  VOCABULARY = "vocabulary",
  AI_CHAT = "ai_chat",
  FLASHCARD = "flashcard",
  CERTIFICATE = "certificate",
  ANALYTICS = "analytics",
  STUDY_PLAN = "study_plan",
  LIVE_TUTORING = "live_tutoring",
}

interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  requiredTier?: MembershipTierEnum;
  currentTier?: MembershipTierEnum;
}

export const MembershipAccessMiddleware = (resourceType: ResourceType) => {
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

      const userId = req.userInfo.userId;
      const user = await UserModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: { $ne: true },
      });

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Admin bypass
      if (user.role === UserEnum.ADMIN) {
        return next();
      }

      // Get user's current membership tier
      const userMembership = await getUserMembership(userId);
      const currentTier = userMembership?.tier || MembershipTierEnum.FREE;
      const tierConfig = MEMBERSHIP_TIERS[currentTier as MembershipTierEnum];

      // Check access based on resource type
      const accessCheck = await checkResourceAccess(
        resourceType,
        req.params.id,
        userId,
        currentTier,
        tierConfig
      );

      if (!accessCheck.hasAccess) {
        const error = new CustomException(
          StatusCodeEnum.Forbidden_403,
          accessCheck.reason || "Access denied"
        );
        (error as any).data = {
          requiredTier: accessCheck.requiredTier,
          currentTier: accessCheck.currentTier,
        };
        throw error;
      }

      next();
    } catch (error) {
      if (error instanceof CustomException) {
        const response: any = {
          code: error.code,
          message: error.message,
        };
        if ((error as any).data) {
          response.data = (error as any).data;
        }
        res.status(error.code).json(response);
      } else {
        res.status(StatusCodeEnum.InternalServerError_500).json({
          code: StatusCodeEnum.InternalServerError_500,
          message: error instanceof Error ? error.message : "Internal Server Error",
        });
      }
    }
  };
};

async function getUserMembership(userId: string): Promise<any> {
  try {
    const userMembership = await UserMembershipModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      endDate: { $gte: new Date() },
      isDeleted: { $ne: true },
    }).populate("membershipId");

    if (userMembership) {
      return {
        tier: userMembership.tier,
        features: userMembership.features,
        endDate: userMembership.endDate,
      };
    }

    // Return default free tier if no active membership
    return {
      tier: MembershipTierEnum.FREE,
      features: MEMBERSHIP_TIERS[MembershipTierEnum.FREE].features,
      endDate: null,
    };
  } catch (error) {
    console.error("Error getting user membership:", error);
    return {
      tier: MembershipTierEnum.FREE,
      features: MEMBERSHIP_TIERS[MembershipTierEnum.FREE].features,
      endDate: null,
    };
  }
}

async function checkResourceAccess(
  resourceType: ResourceType,
  resourceId: string,
  userId: string,
  currentTier: MembershipTierEnum,
  tierConfig: any
): Promise<AccessCheckResult> {
  switch (resourceType) {
    case ResourceType.COURSE:
      return await checkCourseAccess(resourceId, userId, currentTier, tierConfig);
    
    case ResourceType.LESSON:
      return await checkLessonAccess(resourceId, userId, currentTier, tierConfig);
    
    case ResourceType.TEST:
      return await checkTestAccess(resourceId, userId, currentTier, tierConfig);
    
    case ResourceType.EXERCISE:
      return await checkExerciseAccess(resourceId, userId, currentTier, tierConfig);
    
    case ResourceType.GRAMMAR:
      return await checkGrammarAccess(resourceId, userId, currentTier, tierConfig);
    
    case ResourceType.VOCABULARY:
      return await checkVocabularyAccess(resourceId, userId, currentTier, tierConfig);
    
    case ResourceType.AI_CHAT:
      return checkAIChatAccess(currentTier, tierConfig);
    
    case ResourceType.FLASHCARD:
      return checkFlashcardAccess(currentTier, tierConfig);
    
    case ResourceType.CERTIFICATE:
      return checkCertificateAccess(currentTier, tierConfig);
    
    case ResourceType.ANALYTICS:
      return checkAnalyticsAccess(currentTier, tierConfig);
    
    case ResourceType.STUDY_PLAN:
      return checkStudyPlanAccess(currentTier, tierConfig);
    
    case ResourceType.LIVE_TUTORING:
      return checkLiveTutoringAccess(currentTier, tierConfig);
    
    default:
      return { hasAccess: false, reason: "Unknown resource type" };
  }
}

async function checkCourseAccess(
  courseId: string,
  userId: string,
  currentTier: MembershipTierEnum,
  tierConfig: any
): Promise<AccessCheckResult> {
  const course = await CourseModel.findOne({
    _id: new mongoose.Types.ObjectId(courseId),
    isDeleted: { $ne: true },
  });

  if (!course) {
    return { hasAccess: false, reason: "Course not found" };
  }

  // Check if user already has access to this course
  const userCourse = await UserCourseModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    courseId: new mongoose.Types.ObjectId(courseId),
    isDeleted: { $ne: true },
  });

  if (userCourse) {
    return { hasAccess: true };
  }

  // Check course type and tier requirements
  if (course.type === CourseTypeEnum.MEMBERSHIP) {
    if (!tierConfig.features.premiumCourses) {
      return {
        hasAccess: false,
        reason: "Premium courses require a higher membership tier",
        requiredTier: MembershipTierEnum.PREMIUM,
        currentTier,
      };
    }
  }

  // Check course limit
  const userCoursesCount = await UserCourseModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: { $ne: true },
  });

  if (tierConfig.features.maxCourses !== -1 && userCoursesCount >= tierConfig.features.maxCourses) {
    return {
      hasAccess: false,
      reason: `Course limit reached. Maximum ${tierConfig.features.maxCourses} courses allowed for ${currentTier} tier.`,
      requiredTier: MembershipTierEnum.PRO,
      currentTier,
    };
  }

  return { hasAccess: true };
}

async function checkLessonAccess(
  lessonId: string,
  userId: string,
  currentTier: MembershipTierEnum,
  tierConfig: any
): Promise<AccessCheckResult> {
  const lesson = await LessonModel.findOne({
    _id: new mongoose.Types.ObjectId(lessonId),
    isDeleted: { $ne: true },
  }).populate("courseId");

  if (!lesson) {
    return { hasAccess: false, reason: "Lesson not found" };
  }

  // Check if user has access to the course
  const courseAccess = await checkCourseAccess(
    lesson.courseId._id.toString(),
    userId,
    currentTier,
    tierConfig
  );

  if (!courseAccess.hasAccess) {
    return courseAccess;
  }

  // Check daily lesson limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lessonsCompletedToday = await UserLessonModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    status: UserLessonStatus.COMPLETED,
    updatedAt: { $gte: today },
  });

  if (tierConfig.features.maxLessonsPerDay !== -1 && lessonsCompletedToday >= tierConfig.features.maxLessonsPerDay) {
    return {
      hasAccess: false,
      reason: `Daily lesson limit reached. Maximum ${tierConfig.features.maxLessonsPerDay} lessons per day for ${currentTier} tier.`,
      requiredTier: MembershipTierEnum.PREMIUM,
      currentTier,
    };
  }

  return { hasAccess: true };
}

async function checkTestAccess(
  testId: string,
  userId: string,
  currentTier: MembershipTierEnum,
  tierConfig: any
): Promise<AccessCheckResult> {
  const test = await TestModel.findOne({
    _id: new mongoose.Types.ObjectId(testId),
    isDeleted: { $ne: true },
  });

  if (!test) {
    return { hasAccess: false, reason: "Test not found" };
  }

  // Check test retakes
  const userTests = await UserTestModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    testId: new mongoose.Types.ObjectId(testId),
    isDeleted: { $ne: true },
  });

  if (tierConfig.features.testRetakes !== -1 && userTests.length >= tierConfig.features.testRetakes) {
    return {
      hasAccess: false,
      reason: `Test retake limit reached. Maximum ${tierConfig.features.testRetakes} retakes for ${currentTier} tier.`,
      requiredTier: MembershipTierEnum.PRO,
      currentTier,
    };
  }

  return { hasAccess: true };
}

async function checkExerciseAccess(
  exerciseId: string,
  userId: string,
  currentTier: MembershipTierEnum,
  tierConfig: any
): Promise<AccessCheckResult> {
  const exercise = await ExerciseModel.findOne({
    _id: new mongoose.Types.ObjectId(exerciseId),
    isDeleted: { $ne: true },
  });

  if (!exercise) {
    return { hasAccess: false, reason: "Exercise not found" };
  }

  // Exercise access is typically tied to lesson access
  return { hasAccess: true };
}

async function checkGrammarAccess(
  grammarId: string,
  userId: string,
  currentTier: MembershipTierEnum,
  tierConfig: any
): Promise<AccessCheckResult> {
  const grammar = await GrammarModel.findOne({
    _id: new mongoose.Types.ObjectId(grammarId),
    isDeleted: { $ne: true },
  });

  if (!grammar) {
    return { hasAccess: false, reason: "Grammar not found" };
  }

  return { hasAccess: true };
}

async function checkVocabularyAccess(
  vocabularyId: string,
  userId: string,
  currentTier: MembershipTierEnum,
  tierConfig: any
): Promise<AccessCheckResult> {
  const vocabulary = await VocabularyModel.findOne({
    _id: new mongoose.Types.ObjectId(vocabularyId),
    isDeleted: { $ne: true },
  });

  if (!vocabulary) {
    return { hasAccess: false, reason: "Vocabulary not found" };
  }

  return { hasAccess: true };
}

function checkAIChatAccess(
  currentTier: MembershipTierEnum,
  tierConfig: any
): AccessCheckResult {
  if (!tierConfig.features.aiChatAccess) {
    return {
      hasAccess: false,
      reason: "AI Chat requires a higher membership tier",
      requiredTier: MembershipTierEnum.PREMIUM,
      currentTier,
    };
  }
  return { hasAccess: true };
}

function checkFlashcardAccess(
  currentTier: MembershipTierEnum,
  tierConfig: any
): AccessCheckResult {
  if (!tierConfig.features.flashcardsUnlimited) {
    return {
      hasAccess: false,
      reason: "Unlimited flashcards require a higher membership tier",
      requiredTier: MembershipTierEnum.PREMIUM,
      currentTier,
    };
  }
  return { hasAccess: true };
}

function checkCertificateAccess(
  currentTier: MembershipTierEnum,
  tierConfig: any
): AccessCheckResult {
  if (!tierConfig.features.certification) {
    return {
      hasAccess: false,
      reason: "Certificates require a higher membership tier",
      requiredTier: MembershipTierEnum.PREMIUM,
      currentTier,
    };
  }
  return { hasAccess: true };
}

function checkAnalyticsAccess(
  currentTier: MembershipTierEnum,
  tierConfig: any
): AccessCheckResult {
  if (!tierConfig.features.advancedAnalytics) {
    return {
      hasAccess: false,
      reason: "Advanced analytics require a higher membership tier",
      requiredTier: MembershipTierEnum.PREMIUM,
      currentTier,
    };
  }
  return { hasAccess: true };
}

function checkStudyPlanAccess(
  currentTier: MembershipTierEnum,
  tierConfig: any
): AccessCheckResult {
  if (!tierConfig.features.customStudyPlans) {
    return {
      hasAccess: false,
      reason: "Custom study plans require a higher membership tier",
      requiredTier: MembershipTierEnum.PREMIUM,
      currentTier,
    };
  }
  return { hasAccess: true };
}

function checkLiveTutoringAccess(
  currentTier: MembershipTierEnum,
  tierConfig: any
): AccessCheckResult {
  if (!tierConfig.features.liveTutoring) {
    return {
      hasAccess: false,
      reason: "Live tutoring requires a higher membership tier",
      requiredTier: MembershipTierEnum.PRO,
      currentTier,
    };
  }
  return { hasAccess: true };
} 