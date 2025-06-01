import mongoose from "mongoose";
import { IQuery } from "../others/IQuery";
import { IUserAchievement } from "../models/IUserAchievement";

export interface IUserAchievementRepository {
  createUserAchievement(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserAchievement | null>;

  updateUserAchievement(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserAchievement | null>;

  deleteUserAchievement(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IUserAchievement | null>;

  getUserAchievement(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IUserAchievement | null>;

  getUserAchievements(
    query: IQuery,
    userId: string
  ): Promise<IUserAchievement[] | []>;

  deleteBatchUserAchievements(
    achievementId: string,
    session?: mongoose.ClientSession
  ): Promise<number>;

  findExistingAchievement(
    achievementId: string,
    userId: string
  ): Promise<IUserAchievement | null>;
}
