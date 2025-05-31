import mongoose from "mongoose";
import { IAchievement } from "../models/IAchievement";
import { IQuery } from "../others/IQuery";

export interface IAchievementRepository {
  createAchievement(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IAchievement>;

  updateAchievement(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IAchievement | null>;

  deleteAchievement(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IAchievement | null>;

  getAchievements(query: IQuery, type?: string): Promise<IAchievement[] | []>;

  getAchievement(id: string): Promise<IAchievement | null>;

  getClosestAchievement(
    type: string,
    currentProgress: number
  ): Promise<IAchievement | null>;

  getExistingAchievement(
    name?: string,
    type?: string,
    goal?: number,
    id?: string
  ): Promise<IAchievement | null>;
}
