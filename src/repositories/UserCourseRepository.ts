import mongoose from "mongoose";
import { IUserCourse } from "../interfaces/models/IUserCourse";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";
import { IUserCourseRepository } from "../interfaces/repositories/IUserCourseRepository";
import UserCourseModel from "../models/UserCourseModel";

@Service()
class UserCourseRepository implements IUserCourseRepository {
  async createUserCourse(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse> {
    try {
      const userCourse = await UserCourseModel.create([data], { session });
      return userCourse[0];
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

  async updateUserCourse(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse | null> {
    try {
      const userCourse = await UserCourseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );
      if (!userCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserCourse not found"
        );
      }
      return userCourse;
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

  async deleteUserCourse(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse | null> {
    try {
      const userCourse = await UserCourseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );
      if (!userCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserCourse not found"
        );
      }
      return userCourse;
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

  async getUserCourseById(id: string): Promise<IUserCourse | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const userCourse = await UserCourseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
      ]);

      if (!userCourse || userCourse.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserCourse not found"
        );
      }

      return userCourse[0];
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

  async getUserCoursesByUserId(
    userId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      };
      let sortField = "createdAt";
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;
        case SortByType.NAME:
          sortField = "name";
          break;
        default:
          break;
      }
      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      const skip = (query.page - 1) * query.size;

      const userCourses = await UserCourseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await UserCourseModel.countDocuments(matchQuery);

      return {
        data: userCourses,
        page: query.page,
        total: total,
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
}

export default UserCourseRepository;
