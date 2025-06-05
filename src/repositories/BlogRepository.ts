import { Service } from "typedi";
import { IBlogRepository } from "../interfaces/repositories/IBlogRepository";
import mongoose, { ClientSession } from "mongoose";
import { IBlog } from "../interfaces/models/IBlog";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import BlogModel from "../models/BlogModel";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class BlogRepository implements IBlogRepository {
  async createBlog(
    data: object,
    session?: ClientSession
  ): Promise<IBlog | null> {
    try {
      const blog = await BlogModel.create([data], { session });

      return blog[0];
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async updateBlog(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IBlog | null> {
    try {
      const blog = await BlogModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { data },
        { session, new: true }
      );

      if (!blog) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Blog not found"
        );
      }

      return blog;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async deleteBlog(id: string, session?: ClientSession): Promise<IBlog | null> {
    try {
      const blog = await BlogModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      if (!blog) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Blog not found"
        );
      }

      return blog;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getBlog(id: string): Promise<IBlog | null> {
    try {
      const blog = await BlogModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      }).populate("userId");

      if (!blog) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Blog not found"
        );
      }

      return blog;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getBlogs(query: IQuery): Promise<IPagination> {
    type SearchQuery = {
      title?: { $regex: string; $options: string };
      isDeleted?: boolean;
    };
    try {
      const matchQuery: SearchQuery = { isDeleted: false };

      if (query.search) {
        matchQuery.title = {
          $regex: query.search,
          $options: "i",
        };
      }

      let sortField = "createdAt";
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;

        case SortByType.NAME:
          sortField = "title";
          break;
        default:
          break;
      }

      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      const skip = (query.page - 1) * query.size;

      const blogs = await BlogModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await BlogModel.countDocuments(matchQuery);
      return {
        data: blogs,
        total: total,
        page: query.page,
        totalPages: Math.ceil(total / query.size),
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getBlogByTitle(title: string): Promise<IBlog | null> {
    try {
      const escapeRegex = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const blog = await BlogModel.findOne({
        title: { $regex: `^${escapeRegex(title)}$`, isDeleted: false },
      });

      return blog;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }
}
export default BlogRepository;
