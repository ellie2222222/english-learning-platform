export enum MembershipTierEnum {
  FREE = "free",
  BASIC = "basic",
  PREMIUM = "premium",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export interface IMembershipTier {
  tier: MembershipTierEnum;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
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
  color: string;
  icon: string;
}

export const MEMBERSHIP_TIERS: Record<MembershipTierEnum, IMembershipTier> = {
  [MembershipTierEnum.FREE]: {
    tier: MembershipTierEnum.FREE,
    name: "Free",
    description: "Basic access to essential learning features",
    price: 0,
    duration: 0,
    features: {
      maxCourses: 3,
      maxLessonsPerDay: 2,
      aiChatAccess: false,
      premiumCourses: false,
      offlineAccess: false,
      prioritySupport: false,
      customStudyPlans: false,
      advancedAnalytics: false,
      groupStudy: false,
      certification: false,
      liveTutoring: false,
      flashcardsUnlimited: false,
      testRetakes: 0,
      progressTracking: true,
      exportCertificates: false,
    },
    color: "#6B7280",
    icon: "🎓",
  },
  [MembershipTierEnum.BASIC]: {
    tier: MembershipTierEnum.BASIC,
    name: "Basic",
    description: "Enhanced learning experience with more features",
    price: 9.99,
    duration: 30,
    features: {
      maxCourses: 10,
      maxLessonsPerDay: 5,
      aiChatAccess: false,
      premiumCourses: false,
      offlineAccess: false,
      prioritySupport: false,
      customStudyPlans: false,
      advancedAnalytics: false,
      groupStudy: false,
      certification: false,
      liveTutoring: false,
      flashcardsUnlimited: false,
      testRetakes: 1,
      progressTracking: true,
      exportCertificates: false,
    },
    color: "#3B82F6",
    icon: "⭐",
  },
  [MembershipTierEnum.PREMIUM]: {
    tier: MembershipTierEnum.PREMIUM,
    name: "Premium",
    description: "Comprehensive learning with AI assistance and premium content",
    price: 19.99,
    duration: 30,
    features: {
      maxCourses: 50,
      maxLessonsPerDay: 15,
      aiChatAccess: true,
      premiumCourses: true,
      offlineAccess: true,
      prioritySupport: false,
      customStudyPlans: true,
      advancedAnalytics: true,
      groupStudy: false,
      certification: true,
      liveTutoring: false,
      flashcardsUnlimited: true,
      testRetakes: 3,
      progressTracking: true,
      exportCertificates: true,
    },
    color: "#8B5CF6",
    icon: "💎",
  },
  [MembershipTierEnum.PRO]: {
    tier: MembershipTierEnum.PRO,
    name: "Pro",
    description: "Professional learning with live tutoring and advanced features",
    price: 39.99,
    duration: 30,
    features: {
      maxCourses: -1, // unlimited
      maxLessonsPerDay: -1, // unlimited
      aiChatAccess: true,
      premiumCourses: true,
      offlineAccess: true,
      prioritySupport: true,
      customStudyPlans: true,
      advancedAnalytics: true,
      groupStudy: true,
      certification: true,
      liveTutoring: true,
      flashcardsUnlimited: true,
      testRetakes: 5,
      progressTracking: true,
      exportCertificates: true,
    },
    color: "#F59E0B",
    icon: "🔥",
  },
  [MembershipTierEnum.ENTERPRISE]: {
    tier: MembershipTierEnum.ENTERPRISE,
    name: "Enterprise",
    description: "Complete learning solution for organizations and teams",
    price: 99.99,
    duration: 30,
    features: {
      maxCourses: -1, // unlimited
      maxLessonsPerDay: -1, // unlimited
      aiChatAccess: true,
      premiumCourses: true,
      offlineAccess: true,
      prioritySupport: true,
      customStudyPlans: true,
      advancedAnalytics: true,
      groupStudy: true,
      certification: true,
      liveTutoring: true,
      flashcardsUnlimited: true,
      testRetakes: -1, // unlimited
      progressTracking: true,
      exportCertificates: true,
    },
    color: "#DC2626",
    icon: "🏢",
  },
}; 