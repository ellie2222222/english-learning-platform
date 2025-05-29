import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IMembership } from "../interfaces/models/IMembership";

const MembershipModelSchema = new Schema<IMembership>(
  {
    name: { type: String, required: true },
    description: { type: String, require: false },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    ...baseModelSchema,
  },
  { timestamps: true }
);

const MembershipModel: Model<IMembership> = mongoose.model<IMembership>(
  "Membership",
  MembershipModelSchema
);

export default MembershipModel;
