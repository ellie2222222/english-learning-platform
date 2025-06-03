import { IUser } from "../models/IUser";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IUserService {
  createUser: (
    username: string,
    password: string,
    email: string,
    role: number,
    requesterId: string
  ) => Promise<IUser>;

  getUserById: (id: string, requesterId: string) => Promise<IUser>;

  getUsers: (Query: IQuery, requesterId: string) => Promise<IPagination>;

  updateUser: (
    id: string,
    requesterId: string,
    username?: string,
    role?: number,
    avatar?: string
  ) => Promise<IUser | null>;

  deleteUser: (id: string, requesterId: string) => Promise<boolean>;
}
