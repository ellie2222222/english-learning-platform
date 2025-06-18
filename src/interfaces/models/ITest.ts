import mongoose, { Document } from "mongoose";
import { IExercise } from "./IExercise";

export interface ITest extends Document {
  lessonIds: mongoose.Schema.Types.ObjectId[] | string[];
  courseId: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  totalQuestions: number;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  exercises?: IExercise[];
}
