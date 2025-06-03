import mongoose, { ClientSession } from "mongoose";
import { IMembership } from "../interfaces/models/IMembership";
import { IMembershipRepository } from "../interfaces/repositories/IMembershipRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import MembershipModel from "../models/MembershipModel";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class MembershipRepository implements IMembershipRepository {
  async createMembership(
    data: object,
    session?: ClientSession
  ): Promise<IMembership | null> {
    try {
      const membership = await MembershipModel.create([data], { session });
      return membership[0];
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

  async updateMembership(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IMembership | null> {
    try {
      const membership = await MembershipModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );

      if (!membership) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership not found"
        );
      }
      return membership;
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

  async deleteMembership(
    id: string,
    session?: ClientSession
  ): Promise<IMembership | null> {
    try {
      const membership = await MembershipModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      if (!membership) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership not found"
        );
      }

      return membership;
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

  async getMembership(id: string): Promise<IMembership | null> {
    try {
      const membership = await MembershipModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      });

      if (!membership) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership not found"
        );
      }

      return membership;
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

  async getMemberships(query: IQuery): Promise<IPagination> {
    type SearchQuery = {
      name?: { $regex: string; $options: string };
      isDeleted?: boolean;
    };
    try {
      const matchQuery: SearchQuery = { isDeleted: false };
      if (query.search) {
        matchQuery.name = { $regex: query.search, $options: "i" };
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

      const memberships = await MembershipModel.aggregate([
        { $match: matchQuery },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await MembershipModel.countDocuments(matchQuery);
      return {
        data: memberships,
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

  async getExistingMembership(
    name: string,
    id?: string
  ): Promise<IMembership | null> {
    type SearchQuery = {
      name?: { $regex: string; $options: string };
      _id?: { $ne: mongoose.Types.ObjectId };
      isDeleted: boolean;
    };

    try {
      const escapeRegex = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchQuery: SearchQuery = {
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
        isDeleted: false,
      };

      if (id) {
        matchQuery._id = { $ne: new mongoose.Types.ObjectId(id) };
      }

      const membership = await MembershipModel.findOne(matchQuery);

      return membership;
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

export default MembershipRepository;
