export const UserCourseStatus = {
  ONGOING: "ongoing",
  COMPLETED: "completed",
} as const;

export type UserCourseStatusType = typeof UserCourseStatus[keyof typeof UserCourseStatus];
