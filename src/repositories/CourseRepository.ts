import mongoose from "mongoose";
import { ICourse } from "../interfaces/models/ICourse";
import CourseModel from "../models/CourseModel";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";
import { ICourseRepository } from "../interfaces/repositories/ICourseRepository";

@Service()
class CourseRepository implements ICourseRepository {
  async createCourse(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ICourse> {
    try {
      const course = await CourseModel.create([data], { session });

      return course[0];
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

  async updateCourse(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ICourse | null> {
    try {
      const course = await CourseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );

      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      return course;
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

  async deleteCourse(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<ICourse | null> {
    try {
      const course = await CourseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }
      return course;
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

  async getCourseById(id: string): Promise<ICourse | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };

      const course = await CourseModel.findOne(matchQuery);

      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }
      return course;
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

  async getCourses(query: IQuery, type?: string): Promise<IPagination> {
    type SearchQuery = { type?: string; name?: string; isDeleted: false };
    try {
      const matchQuery: SearchQuery = { isDeleted: false };

      if (type) {
        matchQuery.type = type;
      }

      if (query.search) {
        matchQuery.name = query.search;
      }

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

      const courses = await CourseModel.aggregate([
        { $match: matchQuery },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await CourseModel.countDocuments(matchQuery);

      return {
        data: courses,
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

export default CourseRepository;
