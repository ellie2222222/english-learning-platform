import mongoose, { Document } from "mongoose";

export interface IUserAchievement extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  achievementId: mongoose.Schema.Types.ObjectId;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
