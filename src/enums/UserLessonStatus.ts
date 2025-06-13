export const UserLessonStatus = {
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

export type UserLessonStatusType = typeof UserLessonStatus[keyof typeof UserLessonStatus];