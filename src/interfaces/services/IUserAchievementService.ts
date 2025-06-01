import { IUserAchievement } from "../models/IUserAchievement";
import { IQuery } from "../others/IQuery";

export interface IUserAchievementService {
  getUserAchievements(
    query: IQuery,
    userId: string
  ): Promise<IUserAchievement[] | []>;

  getUserAchievement(id: string): Promise<IUserAchievement | null>;

  createUserAchievement(
    userId: string,
    achievementId: string
  ): Promise<IUserAchievement | null>;
}
