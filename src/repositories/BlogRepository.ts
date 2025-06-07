import { Service } from "typedi";
import { IBlogRepository } from "../interfaces/repositories/IBlogRepository";
import mongoose, { ClientSession } from "mongoose";
import { IBlog } from "../interfaces/models/IBlog";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import BlogModel from "../models/BlogModel";
import { IPagination } from "../interfaces/others/IPagination";
import { BlogStatusEnum } from "../enums/BlogStatusEnum";

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
        { ...data },
        { session, new: true }
      ).lean();

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
      ).lean();

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

  async getBlog(id: string, isAdmin?: boolean): Promise<IBlog | null> {
    try {
      const matchQuery: {
        _id: mongoose.Types.ObjectId;
        isDeleted: boolean;
        status?: string;
      } = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      if (!isAdmin) {
        matchQuery.status = BlogStatusEnum.PUBLISHED;
      }
      const blog = await BlogModel.findOne(matchQuery)
        .populate("userId")
        .lean();

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

  async getBlogs(query: IQuery, isAdmin?: boolean): Promise<IPagination> {
    type SearchQuery = {
      title?: { $regex: string; $options: string };
      isDeleted?: boolean;
      status?: string;
    };
    try {
      const matchQuery: SearchQuery = { isDeleted: false };

      if (!isAdmin) {
        matchQuery.status = BlogStatusEnum.PUBLISHED;
      }

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

  async getBlogByTitle(title: string, id?: string): Promise<IBlog | null> {
    type SearchQuery = {
      title: { $regex: string; $options: string };
      _id?: { $ne: mongoose.Types.ObjectId };
      isDeleted: boolean;
    };
    try {
      const escapeRegex = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const matchQuery: SearchQuery = {
        title: { $regex: `^${escapeRegex(title)}$`, $options: "i" },
        isDeleted: false,
      };
      if (id) {
        matchQuery._id = { $ne: new mongoose.Types.ObjectId(id) };
      }
      const blog = await BlogModel.findOne(matchQuery);

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
