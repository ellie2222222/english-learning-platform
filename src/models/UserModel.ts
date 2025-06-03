import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IUser } from "../interfaces/models/IUser";

const userModelSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      default: "",
    },
    role: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    lastOnline: {
      type: Date,
    },
    onlineStreak: {
      type: Number,
    },
    activeUntil: {
      type: Date,
      default: null,
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

// Unique except default value
userModelSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $exists: true, $ne: null } },
  }
);
userModelSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: "" } },
  }
);
userModelSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { phoneNumber: { $exists: true, $ne: null } },
  }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userModelSchema);

export default UserModel;
