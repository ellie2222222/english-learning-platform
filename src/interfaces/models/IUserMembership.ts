import mongoose, { Document } from "mongoose";
import { MembershipTierEnum } from "../../enums/MembershipTierEnum";

export interface IUserMembership extends Document {
  userId: mongoose.Types.ObjectId | string;
  membershipId: mongoose.Types.ObjectId | string;
  tier: MembershipTierEnum;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  features: {
    maxCourses: number;
    maxLessonsPerDay: number;
    aiChatAccess: boolean;
    premiumCourses: boolean;
    offlineAccess: boolean;
    prioritySupport: boolean;
    customStudyPlans: boolean;
    advancedAnalytics: boolean;
    groupStudy: boolean;
    certification: boolean;
    liveTutoring: boolean;
    flashcardsUnlimited: boolean;
    testRetakes: number;
    progressTracking: boolean;
    exportCertificates: boolean;
  };
  usageStats: {
    coursesEnrolled: number;
    lessonsCompleted: number;
    testsTaken: number;
    aiChatUsed: number;
    certificatesEarned: number;
    lastActivityDate: Date;
  };
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 