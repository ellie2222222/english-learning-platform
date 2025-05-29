import { Document } from "mongoose";

export interface IAchievement extends Document {
  name: string;
  description: string;
  type: string;
  goal: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
