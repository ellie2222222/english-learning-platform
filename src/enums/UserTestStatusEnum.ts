export const UserTestStatusEnum = {
  PASSED: "passed",
  FAILED: "failed",
};

export type UserTestStatusEnumType = (typeof UserTestStatusEnum)[keyof typeof UserTestStatusEnum];