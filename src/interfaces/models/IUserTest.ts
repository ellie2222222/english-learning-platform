import mongoose, { Document } from "mongoose";
import { UserTestStatusEnumType } from "../../enums/UserTestStatusEnum";

export interface IUserTest extends Document {
  testId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  attemptNo: number;
  score: number;
  status: UserTestStatusEnumType;
  description: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
