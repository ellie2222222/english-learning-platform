export type IRevenue = {
  Date: string;
  Revenue: number;
};

export type INewUsers = {
  Date: string;
  newUsers: number;
};

export interface IUserStatistics {
  totalPoints: number;
  completedLessons: number;
  completedCourses: number;
  completedTests: number;
}
