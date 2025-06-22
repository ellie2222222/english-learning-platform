export const IncreasePointEnum = {
  LESSON: "lesson",
  COURSE: "course",
  TEST: "test",
};

export type IncreasePointEnumType =
  (typeof IncreasePointEnum)[keyof typeof IncreasePointEnum];
