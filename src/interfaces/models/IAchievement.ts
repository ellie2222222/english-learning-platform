import mongoose, { Document } from "mongoose";

export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  type: string;
  goal: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
