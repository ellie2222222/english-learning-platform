import mongoose, { Model, Schema } from "mongoose";
import { IUserTest } from "../interfaces/models/IUserTest";
import baseModelSchema from "./BaseModel";
import { UserTestStatusEnum } from "../enums/UserTestStatusEnum";

const UserTestModelSchema = new Schema<IUserTest>(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attemptNo: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: Object.values(UserTestStatusEnum),
    },
    description: {
      type: String,
      required: true,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const UserTestModel: Model<IUserTest> = mongoose.model<IUserTest>(
  "UserTest",
  UserTestModelSchema
);

export default UserTestModel;
