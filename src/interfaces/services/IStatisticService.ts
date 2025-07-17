import { INewUsers, IRevenue, IUserStatistics } from "../others/IStatisticData";

export interface IStatisticService {
  getRevenueOverTime: (time: string, value?: number) => Promise<IRevenue[]>;
  getNewUsers: (time: string, value?: number) => Promise<INewUsers[]>;
  getUserStatistics: (userId: string) => Promise<IUserStatistics>;
  getCompletionRate(): Promise<number>;
  getActiveCourseCount(): Promise<number>;
}
