import mongoose, { Document } from "mongoose";
import { ICourse } from "./ICourse";
import { ILessonLengthObject } from "../others/ILessonLengthObject";

export interface ILesson extends Document {
  courseId: mongoose.Schema.Types.ObjectId | string | ICourse;
  name: string;
  description: string;
  length: ILessonLengthObject[];
  order: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
