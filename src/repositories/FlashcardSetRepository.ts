import { Service } from "typedi";
import { IFlashcardSetRepository } from "../interfaces/repositories/IFlashcardSetRepository";
import mongoose, { ClientSession } from "mongoose";
import { IFlashcardSet } from "../interfaces/models/IFlashcardSet";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import FlashcardSetModel from "../models/FlashcardSetModel";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class FlashcardSetRepository implements IFlashcardSetRepository {
  async createFlashcardSet(
    data: object,
    session?: ClientSession
  ): Promise<IFlashcardSet | null> {
    try {
      const flashcardSet = await FlashcardSetModel.create([data], { session });

      return flashcardSet[0];
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

  async updateFlashcardSet(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IFlashcardSet | null> {
    try {
      const flashcardSet = await FlashcardSetModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), isDeleted: false },
        { $set: data },
        { session, new: true }
      );

      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      return flashcardSet;
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

  async deleteFlashcardSet(
    id: string,
    session?: ClientSession
  ): Promise<IFlashcardSet | null> {
    try {
      const flashcardSet = await FlashcardSetModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        {
          $set: { isDeleted: true },
        },
        {
          session,
          new: true,
        }
      );

      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }
      return flashcardSet;
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

  async getFlashcardSet(id: string): Promise<IFlashcardSet | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const flashcardSet = await FlashcardSetModel.aggregate([
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
        {
          $lookup: {
            from: "flashcards",
            localField: "_id",
            foreignField: "flashcardSetId",
            as: "flashcards",
          },
        },
        {
          $addFields: {
            flashcardCount: {
              $size: {
                $filter: {
                  input: "$flashcards",
                  as: "flashcard",
                  cond: { $eq: ["$$flashcard.isDeleted", false] },
                },
              },
            },
          },
        },
        {
          $project: {
            flashcards: 0,
          },
        },
      ]);

      if (!flashcardSet[0]) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      return flashcardSet[0];
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

  async getFlashcardSets(query: IQuery, userId?: string): Promise<IPagination> {
    type SeachQuery = {
      name?: { $regex: string; $options: string };
      isDeleted?: boolean;
      userId?: mongoose.Types.ObjectId;
    };
    try {
      const matchQuery: SeachQuery = { isDeleted: false };

      if (query.search) {
        matchQuery.name = {
          $regex: query.search,
          $options: "i",
        };
      }

      if (userId) {
        matchQuery.userId = new mongoose.Types.ObjectId(userId);
      }

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      switch (query.sortBy) {
        case SortByType.NAME:
          sortField = "name";
          break;

        case SortByType.DATE:
          sortField = "createdAt";
          break;
        default:
          break;
      }
      const skip = (query.page - 1) * query.size;
      const flashcardSets = await FlashcardSetModel.aggregate([
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
        {
          $lookup: {
            from: "flashcards",
            localField: "_id",
            foreignField: "flashcardSetId",
            as: "flashcards",
          },
        },
        {
          $addFields: {
            flashcardCount: {
              $size: {
                $filter: {
                  input: "$flashcards",
                  as: "flashcard",
                  cond: { $eq: ["$$flashcard.isDeleted", false] },
                },
              },
            },
          },
        },
        {
          $project: {
            flashcards: 0,
          },
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: query.size },
      ]);
      const totalCount = await FlashcardSetModel.countDocuments(matchQuery);
      return {
        data: flashcardSets,
        total: totalCount,
        page: query.page,
        totalPages: Math.ceil(totalCount / query.size),
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

  async getFlashcardSetByName(name: string, id?: string) {
    try {
      const escapeRegex = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const matchQuery: {
        name: { $regex: string; $options: string };
        isDeleted?: boolean;
        _id?: { $ne: mongoose.Types.ObjectId };
      } = {
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
        isDeleted: false,
      };

      if (id) {
        matchQuery._id = { $ne: new mongoose.Types.ObjectId(id) };
      }

      const flashcardSet = await FlashcardSetModel.findOne(matchQuery);

      return flashcardSet;
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

  async getFlashcardSetsByUserId(userId: string): Promise<IFlashcardSet[]> {
    try {
      const flashcardSets = await FlashcardSetModel.find({
        userId,
        isDeleted: false,
      });
      return flashcardSets;
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
export default FlashcardSetRepository;
