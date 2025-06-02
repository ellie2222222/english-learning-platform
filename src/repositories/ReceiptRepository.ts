import { Service } from "typedi";
import { IReceiptRepository } from "../interfaces/repositories/IReceiptRepository";
import mongoose, { ClientSession } from "mongoose";
import { IReceipt } from "../interfaces/models/IReceipt";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import ReceiptModel from "../models/ReceiptModel";

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
      const receipt = await ReceiptModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      }).populate("membershipId");

      return receipt;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getReceipts(query: IQuery, userId: string): Promise<IReceipt[] | []> {
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
      const receipts = await ReceiptModel.aggregate([
        {
          $lookup: {
            from: "memberships",
            localField: "membershipId",
            foreignField: "_id",
            as: "membership",
          },
        },
        { $unwind: "$membership" },
        { $match: matchQuery },
        { $sort: { [sortField]: order } },
        { $limit: query.size },
      ]);

      return receipts;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

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
