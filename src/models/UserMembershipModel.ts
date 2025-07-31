import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IUserMembership } from "../interfaces/models/IUserMembership";
import { MembershipTierEnum } from "../enums/MembershipTierEnum";

const UserMembershipModelSchema = new Schema<IUserMembership>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    tier: {
      type: String,
      enum: [MembershipTierEnum.FREE, MembershipTierEnum.BASIC, MembershipTierEnum.PREMIUM, MembershipTierEnum.PRO, MembershipTierEnum.ENTERPRISE],
      required: true,
      default: MembershipTierEnum.FREE,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    autoRenew: {
      type: Boolean,
      required: true,
      default: false,
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    lastPaymentDate: {
      type: Date,
      required: false,
    },
    nextPaymentDate: {
      type: Date,
      required: false,
    },
    features: {
      maxCourses: { type: Number, required: true, default: 3 },
      maxLessonsPerDay: { type: Number, required: true, default: 2 },
      aiChatAccess: { type: Boolean, required: true, default: false },
      premiumCourses: { type: Boolean, required: true, default: false },
      offlineAccess: { type: Boolean, required: true, default: false },
      prioritySupport: { type: Boolean, required: true, default: false },
      customStudyPlans: { type: Boolean, required: true, default: false },
      advancedAnalytics: { type: Boolean, required: true, default: false },
      groupStudy: { type: Boolean, required: true, default: false },
      certification: { type: Boolean, required: true, default: false },
      liveTutoring: { type: Boolean, required: true, default: false },
      flashcardsUnlimited: { type: Boolean, required: true, default: false },
      testRetakes: { type: Number, required: true, default: 0 },
      progressTracking: { type: Boolean, required: true, default: true },
      exportCertificates: { type: Boolean, required: true, default: false },
    },
    usageStats: {
      coursesEnrolled: { type: Number, default: 0 },
      lessonsCompleted: { type: Number, default: 0 },
      testsTaken: { type: Number, default: 0 },
      aiChatUsed: { type: Number, default: 0 },
      certificatesEarned: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: Date.now },
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

// Index for efficient queries
UserMembershipModelSchema.index({ userId: 1, isActive: 1 });
UserMembershipModelSchema.index({ endDate: 1, isActive: 1 });

const UserMembershipModel: Model<IUserMembership> = mongoose.model<IUserMembership>(
  "UserMembership",
  UserMembershipModelSchema
);

export default UserMembershipModel; 