import mongoose, { Document } from "mongoose";
import { IExercise } from "./IExercise";
import { ICourse } from "./ICourse";
import { ILesson } from "./ILesson";
import { IQuestion } from "./IQuestion";

export interface ITest extends Document {
  lessonIds: mongoose.Schema.Types.ObjectId[] | string[] | ILesson[];
  courseId: mongoose.Schema.Types.ObjectId | ICourse;
  name: string;
  description: string;
  totalQuestions: number;
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  questions?: IQuestion[];
}
