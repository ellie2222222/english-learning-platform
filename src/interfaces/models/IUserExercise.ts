import mongoose, { Document, Types } from "mongoose";

export interface IUserExercise extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  exerciseId: mongoose.Schema.Types.ObjectId;
  completed: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
