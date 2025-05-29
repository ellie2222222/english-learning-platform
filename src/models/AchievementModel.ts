import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IAchievement } from "../interfaces/models/IAchievement";
import { AchievementTypeEnum } from "../enums/AchievementTypeEnum";

const achievementModelSchema = new Schema<IAchievement>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },

    type: {
      type: String,
      required: true,
      enum: Object.values(AchievementTypeEnum),
    },
    goal: {
      type: Number,
      required: true,
    },
    ...baseModelSchema,
  },
  { timestamps: true }
);

const AchievementModel: Model<IAchievement> = mongoose.model<IAchievement>(
  "Achievement",
  achievementModelSchema
);

export default AchievementModel;
