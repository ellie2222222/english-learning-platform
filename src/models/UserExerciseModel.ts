import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IUserExercise } from "../interfaces/models/IUserExercise";

const UserExerciseSchema = new Schema<IUserExercise>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    completed: { type: Boolean, default: false },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const UserExerciseModel: Model<IUserExercise> = mongoose.model<IUserExercise>(
  "UserExercise",
  UserExerciseSchema
);

export default UserExerciseModel;
