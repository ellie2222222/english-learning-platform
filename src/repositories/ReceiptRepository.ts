import { Service } from "typedi";
import { IReceiptRepository } from "../interfaces/repositories/IReceiptRepository";
import mongoose, { ClientSession } from "mongoose";
import { IReceipt } from "../interfaces/models/IReceipt";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import ReceiptModel from "../models/ReceiptModel";
import { IPagination } from "../interfaces/others/IPagination";
import { IRevenue } from "../interfaces/others/IStatisticData";

@Service()
class ReceiptRepository implements IReceiptRepository {
  async createReceipt(
    data: object,
    session?: ClientSession
  ): Promise<IReceipt | null> {
    try {
      const receipt = await ReceiptModel.create([data], { session });
      return receipt[0];
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

  async updateReceipt(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IReceipt | null> {
    try {
      const receipt = await ReceiptModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );

      if (!receipt) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Receipt not found"
        );
      }

      return receipt;
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

  async deleteReceipt(
    id: string,
    session?: ClientSession
  ): Promise<IReceipt | null> {
    try {
      const receipt = await ReceiptModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      if (!receipt) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Receipt not found"
        );
      }

      return receipt;
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

  async getReceipt(id: string): Promise<IReceipt | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const receipt = await ReceiptModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "memberships",
            localField: "membershipId",
            foreignField: "_id",
            as: "membership",
          },
        },
        { $unwind: "$membership" },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ]);

      if (!receipt[0]) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Receipt not found"
        );
      }

      return receipt[0];
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

  async getReceipts(query: IQuery, userId: string): Promise<IPagination> {
    type SearchQuery = {
      "membership.name"?: { $regex: string; $options: string };
      isDeleted?: boolean;
    };
    try {
      const matchQuery: SearchQuery = { isDeleted: false };
      if (query.name) {
        matchQuery["membership.name"] = { $regex: query.name, $options: "i" };
      }

      let sortField = "createdAt";
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;

        case SortByType.NAME:
          sortField = "membership.name";
          break;

        default:
          break;
      }

      const order = query.order === OrderType.ASC ? 1 : -1;
      const skip = query.size * (query.page - 1);
      const receipts = await ReceiptModel.aggregate([
        {
          $lookup: {
            from: "memberships",
            localField: "membershipId",
            foreignField: "_id",
            as: "membership",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $unwind: "$membership" },
        { $match: matchQuery },
        { $sort: { [sortField]: order } },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await ReceiptModel.countDocuments(matchQuery);
      return {
        data: receipts,
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

  async getAllReceipts(query: IQuery): Promise<IPagination> {
    try {
      const matchQuery = { isDeleted: false };
      let sortField = "createdAt";
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;

        case SortByType.NAME:
          sortField = "membership.name";
          break;

        default:
          break;
      }
      const order = query.order === OrderType.ASC ? 1 : -1;
      const skip = query.size * (query.page - 1);

      const receipts = await ReceiptModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "memberships",
            localField: "membershipId",
            foreignField: "_id",
            as: "membership",
          },
        },
        { $unwind: "$membership" },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $sort: {
            [sortField]: order,
          },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await ReceiptModel.countDocuments(matchQuery);
      return {
        data: receipts,
        total: total,
        totalPages: Math.ceil(total / query.size),
        page: query.page,
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

  async getRevenueByTimeInterval(
    startDate: Date,
    endDate: Date,
    groupBy: string
  ): Promise<IRevenue[]> {
    try {
      const receipts = await ReceiptModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            isDeleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: groupBy, date: "$createdAt" } },
            Revenue: { $sum: "$amount" },
          },
        },
        {
          $project: {
            Date: "$_id",
            Revenue: 1,
            _id: 0,
          },
        },
        { $sort: { Date: 1 } },
      ]);

      return receipts;
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

  async getAllReceiptsTimeInterval(
    startDate: Date,
    endDate: Date
  ): Promise<IReceipt[]> {
    try {
      const receipts = await ReceiptModel.find({
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: { $ne: true },
      }).lean();
      return receipts;
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

export default ReceiptRepository;
