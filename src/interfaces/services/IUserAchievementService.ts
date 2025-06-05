import { IUserAchievement } from "../models/IUserAchievement";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IUserAchievementService {
  getUserAchievements: (
    query: IQuery,
    userId: string,
    requesterId: string
  ) => Promise<IPagination>;

  getUserAchievement: (
    id: string,
    requesterId: string
  ) => Promise<IUserAchievement | null>;

  createUserAchievement: (
    userId: string,
    achievementId: string
  ) => Promise<IUserAchievement | null>;
}
