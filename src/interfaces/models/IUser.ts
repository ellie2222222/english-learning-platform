import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  role: number;
  avatar: string;
  googleId: string;
  email: string;
  password: string;
  lastOnline: Date;
  onlineStreak: number;
  activeUntil: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}