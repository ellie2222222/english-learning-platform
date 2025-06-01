import mongoose, { Model, Schema } from "mongoose";
import { IBlog } from "../interfaces/models/IBlog";
import baseModelSchema from "./BaseModel";
import { BlogStatusEnum } from "../enums/BlogStatusEnum";

const BlogModelSchema = new Schema<IBlog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(BlogStatusEnum),
      default: BlogStatusEnum.DRAFTING,
    },
    ...baseModelSchema.obj,
  },

  { timestamps: true }
);

const BlogModel: Model<IBlog> = mongoose.model<IBlog>("Blog", BlogModelSchema);

export default BlogModel;
