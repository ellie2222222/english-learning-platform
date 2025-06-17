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
  activeUntil: Date | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  resetPasswordPin: {
    value: string | null;
    expiresAt: Date | null;
    isVerified: boolean;
  };
  xp: number;
}
