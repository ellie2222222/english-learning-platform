import mongoose from "mongoose";
import { IAchievement } from "../models/IAchievement";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IAchievementService {
  createAchievement(
    name: string,
    description: string,
    type: string,
    goal: number
  ): Promise<IAchievement>;

  updateAchievement(
    id: string,
    name?: string,
    description?: string,
    type?: string,
    goal?: number
  ): Promise<IAchievement | null>;

  deleteAchievement(id: string): Promise<IAchievement | null>;

  getAchievements(query: IQuery, type?: string): Promise<IPagination>;

  getAchievement(id: string): Promise<IAchievement | null>;
}
