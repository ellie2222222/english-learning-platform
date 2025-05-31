import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IReceipt } from "../interfaces/models/IReceipt";
import { PaymentMethodEnum } from "../enums/PaymentMethodEnum";
import { PaymentGatewayEnum } from "../enums/PaymentGatewayEnum";

const ReceiptModelSchema = new Schema<IReceipt>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: Object.values(PaymentMethodEnum),
    },
    paymentGateway: {
      type: String,
      required: true,
      enum: Object.values(PaymentGatewayEnum),
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const ReceiptModel: Model<IReceipt> = mongoose.model<IReceipt>(
  "Receipt",
  ReceiptModelSchema
);

export default ReceiptModel;
