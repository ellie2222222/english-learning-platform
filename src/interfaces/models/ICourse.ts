import { Document } from "mongoose";

export interface ICourse extends Document {
  name: string;
  description: string;
  level: string;
  type: string;
  totalLessons: number;
  coverImage: string,
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
