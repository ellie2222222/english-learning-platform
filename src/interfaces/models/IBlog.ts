import mongoose, { Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
  coverImage: string;
  status: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
