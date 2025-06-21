import mongoose, { Types } from "mongoose";
import { IUser } from "../models/IUser";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";
import { INewUsers } from "../others/IStatisticData";

export interface IUserRepository {
  createUser(data: object, session?: mongoose.ClientSession): Promise<IUser>;

  getUserById(userId: string, ignoreDeleted?: boolean): Promise<IUser | null>;

  getUserByEmail(email: string): Promise<IUser | null>;

  getGoogleUser(email: string, googleId: string): Promise<IUser | null>;

  deleteUserById(
    userId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean>;

  updateUserById(
    userId: string,
    data: Partial<IUser>,
    session?: mongoose.ClientSession
  ): Promise<IUser | null>;

  getUsers(query: IQuery): Promise<IPagination>;

  getAllUsersTimeInterval(
    startDate: Date,
    endDate: Date,
    groupBy: string
  ): Promise<INewUsers[]>;

  getExpiredUsers(): Promise<IUser[] | []>;

  getAllUserForLoginAchievement(goal: number): Promise<IUser[]>;

  getTopLeaderBoardUser(top: number, field: string): Promise<IUser[]>;
}
