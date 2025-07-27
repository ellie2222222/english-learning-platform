import { INewUsers, IRevenue, IUserStatistics } from "../others/IStatisticData";

export interface IStatisticService {
  getRevenueOverTime: (time: string, value?: number) => Promise<IRevenue[]>;
  getNewUsers: (time: string, value?: number) => Promise<INewUsers[]>;
  getUserStatistics: (userId: string) => Promise<IUserStatistics>;
  getCompletionRate(): Promise<{ currentRate: number; previousRate: number; trend: number }>;
  getActiveCourseCount(): Promise<number>;
  getTotalUserCount(): Promise<number>;
}
