import mongoose from "mongoose";
import { IUserTest } from "../interfaces/models/IUserTest"; 
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination"; 
import { IUserTestRepository } from "../interfaces/repositories/IUserTestRepository";
import UserTestModel from "../models/UserTestModel"; 

@Service()
class UserTestRepository implements IUserTestRepository {
  async createUserTest(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserTest> {
    try {
      const userTest = await UserTestModel.create([data], { session });
      return userTest[0];
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

  async updateUserTest(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserTest | null> {
    try {
      const userTest = await UserTestModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );
      if (!userTest) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserTest not found"
        );
      }
      return userTest;
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

  async deleteUserTest(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IUserTest | null> {
    try {
      const userTest = await UserTestModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );
      if (!userTest) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserTest not found"
        );
      }
      return userTest;
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

  async getUserTestById(id: string): Promise<IUserTest | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const userTest = await UserTestModel.findOne(matchQuery);
      if (!userTest) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserTest not found"
        );
      }
      return userTest;
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

  async getUserTestsByUserId(userId: string, query: IQuery): Promise<IPagination> {
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

      const userTests = await UserTestModel.aggregate([
        { $match: matchQuery },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await UserTestModel.countDocuments(matchQuery);

      return {
        data: userTests,
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

  async getUserTestsByTestId(testId: string, query: IQuery): Promise<IPagination> {
    try {
      const matchQuery = {
        testId: new mongoose.Types.ObjectId(testId),
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

      const userTests = await UserTestModel.aggregate([
        { $match: matchQuery },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await UserTestModel.countDocuments(matchQuery);

      return {
        data: userTests,
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

  async getUserTestByTestUserAndAttempt(testId: string, userId: string, attemptNo: number): Promise<IUserTest | null> {
    try {
      const userTest = await UserTestModel.findOne({
        testId: new mongoose.Types.ObjectId(testId),
        userId: new mongoose.Types.ObjectId(userId),
        attemptNo,
        isDeleted: false,
      }).exec();
      return userTest;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve user test"
      );
    }
  }

  async getLatestAttempt(userId: string, testId: string): Promise<IUserTest | null> {
    try {
      const userTests = await UserTestModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        testId: new mongoose.Types.ObjectId(testId),
        isDeleted: false,
      })
        .sort({ attemptNo: -1 })
        .limit(1)
        .exec();
      return userTests.length > 0 ? userTests[0] : null;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve latest attempt"
      );
    }
  }   
}

export default UserTestRepository;