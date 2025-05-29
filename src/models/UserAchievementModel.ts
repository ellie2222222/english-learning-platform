import mongoose, { Model, Schema } from "mongoose";
import { IUserAchievement } from "../interfaces/models/IUserAchievement";
import baseModelSchema from "./BaseModel";

const UserAchievementModelSchema = new Schema<IUserAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    ...baseModelSchema,
  },
  { timestamps: true }
);

const UserAchieventModel: Model<IUserAchievement> =
  mongoose.model<IUserAchievement>(
    "UserAchievement",
    UserAchievementModelSchema
  );

export default UserAchieventModel;
