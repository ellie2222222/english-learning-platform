import mongoose, { ClientSession, Types, Model } from "mongoose";
import { ITest } from "../interfaces/models/ITest";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";
import TestModel from "../models/TestModel";
import { ITestRepository } from "../interfaces/repositories/ITestRepository";
import test from "node:test";

@Service()
class TestRepository implements ITestRepository {
  private testModel: Model<ITest>;

  constructor() {
    this.testModel = TestModel;
  }

  async createTest(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ITest> {
    try {
      const options = session ? { session } : {};
      const [newTest] = await this.testModel.create([data], options);
      return newTest;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create test"
      );
    }
  }

  async updateTest(
    testId: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ITest | null> {
    try {
      const options = session ? { new: true, session } : { new: true };
      const updatedTest = await this.testModel
        .findByIdAndUpdate(testId, data, options)
        .exec();
      return updatedTest;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update test"
      );
    }
  }

  async deleteTest(
    testId: string,
    session?: mongoose.ClientSession
  ): Promise<ITest | null> {
    try {
      const options = session ? { new: true, session } : { new: true };
      const deletedTest = await this.testModel
        .findByIdAndUpdate(testId, { isDeleted: true }, options)
        .exec();
      return deletedTest;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete test"
      );
    }
  }

  async getTestById(id: string): Promise<ITest | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };

      const test = await this.testModel.findOne(matchQuery).lean();
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

  async getTests(query: IQuery, courseId: string): Promise<IPagination> {
    try {
      const matchQuery = {
        isDeleted: false,
        courseId: new mongoose.Types.ObjectId(courseId),
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

      const tests = await this.testModel.aggregate([
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

      const total = await this.testModel.countDocuments(matchQuery);

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

  async getTestOrder(courseId: string): Promise<number> {
    try {
      const test = await this.testModel
        .findOne({
          courseId: new mongoose.Types.ObjectId(courseId),
          isDeleted: false,
        })
        .sort({ order: -1 });

      if (!test) return 1;
      return test.order + 1;
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

  // async getTestsByUserId(userId: string, query: IQuery): Promise<IPagination> {
  //   try {
  //     const matchQuery = {
  //       userId: new mongoose.Types.ObjectId(userId),
  //       isDeleted: false,
  //     };
  //     let sortField = "createdAt";
  //     switch (query.sortBy) {
  //       case SortByType.DATE:
  //         sortField = "createdAt";
  //         break;
  //       case SortByType.NAME:
  //         sortField = "name";
  //         break;
  //       default:
  //         break;
  //     }
  //     const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
  //     const skip = (query.page - 1) * query.size;

  //     const tests = await TestModel.aggregate([
  //       { $match: matchQuery },
  //       {
  //         $lookup: {
  //           from: "lessons",
  //           localField: "lessonIds",
  //           foreignField: "_id",
  //           as: "lessons",
  //         },
  //       },
  //       {
  //         $sort: { [sortField]: sortOrder },
  //       },
  //       { $skip: skip },
  //       { $limit: query.size },
  //     ]);

  //     const total = await TestModel.countDocuments(matchQuery);

  //     return {
  //       data: tests,
  //       page: query.page,
  //       total: total,
  //       totalPages: Math.ceil(total / query.size),
  //     };
  //   } catch (error) {
  //     if (error instanceof CustomException) {
  //       throw error;
  //     }
  //     throw new CustomException(
  //       StatusCodeEnum.InternalServerError_500,
  //       error instanceof Error ? error.message : "Internal Server Error"
  //     );
  //   }
  // }

  async getTestsByLessonIdV2(lessonId: string): Promise<ITest[]> {
    try {
      const tests = await this.testModel.find({
        lessonIds: { $in: [new mongoose.Types.ObjectId(lessonId)] },
        isDeleted: false,
      });

      return tests;
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

      const tests = await this.testModel.aggregate([
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

      const total = await this.testModel.countDocuments(matchQuery);

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

  async deleteTestsByCourseOrLessons(
    courseId: string,
    lessonIds: Types.ObjectId[],
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      const options = session ? { session } : {};
      const result = await this.testModel.updateMany(
        {
          $or: [
            { courseId: new mongoose.Types.ObjectId(courseId) },
            {
              lessonIds: {
                $in: lessonIds.map(
                  (id) => new mongoose.Types.ObjectId(id.toString())
                ),
              },
            },
          ],
        },
        { isDeleted: true },
        options
      );

      return result.acknowledged;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete tests"
      );
    }
  }

  async getTestsByCourseId(courseId: string): Promise<ITest[]> {
    try {
      const tests = await this.testModel.find({
        courseId: new mongoose.Types.ObjectId(courseId),
        isDeleted: false,
      });

      return tests;
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
