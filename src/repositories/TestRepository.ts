import mongoose from "mongoose";
import { ITest } from "../interfaces/models/ITest";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";
import TestModel from "../models/TestModel";
import { ITestRepository } from "../interfaces/repositories/ITestRepository";

@Service()
class TestRepository implements ITestRepository {
  async createTest(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ITest> {
    try {
      const test = await TestModel.create([data], { session });
      return test[0];
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

  async updateTest(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ITest | null> {
    try {
      const test = await TestModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }
      return test;
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

  async deleteTest(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<ITest | null> {
    try {
      const test = await TestModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }
      return test;
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

  async getTestById(id: string): Promise<ITest | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const test = await TestModel.findOne(matchQuery);
      if (!test) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Test not found"
        );
      }
      return test;
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

  async getTests(query: IQuery): Promise<IPagination> {
    try {
      const matchQuery = {
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

      const tests = await TestModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonIds",
            foreignField: "_id",
            as: "lessons",
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await TestModel.countDocuments(matchQuery);

      return {
        data: tests,
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

  async getTestsByUserId(userId: string, query: IQuery): Promise<IPagination> {
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

      const tests = await TestModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonIds",
            foreignField: "_id",
            as: "lessons",
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await TestModel.countDocuments(matchQuery);

      return {
        data: tests,
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

  async getTestsByLessonId(
    lessonId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const matchQuery = {
        lessonIds: { $in: [new mongoose.Types.ObjectId(lessonId)] },
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

      const tests = await TestModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonIds",
            foreignField: "_id",
            as: "lessons",
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await TestModel.countDocuments(matchQuery);

      return {
        data: tests,
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

export default TestRepository;
