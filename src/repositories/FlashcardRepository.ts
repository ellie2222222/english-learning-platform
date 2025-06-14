import { Service } from "typedi";
import { IFlashcardRepository } from "../interfaces/repositories/IFlashcardRepository";
import mongoose, { ClientSession } from "mongoose";
import { IFlashcard } from "../interfaces/models/IFlashcard";
import FlashcardModel from "../models/FlashcardModel";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import getLogger from "../utils/logger";

@Service()
class FlashcardRepository implements IFlashcardRepository {
  async createFlashcard(
    data: object,
    session?: ClientSession
  ): Promise<IFlashcard | null> {
    try {
      const flashcard = await FlashcardModel.create([data], { session });
      return flashcard[0];
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

  async updateFlashcard(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IFlashcard | null> {
    try {
      const flashcard = await FlashcardModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), isDeleted: false },
        { $set: data },
        { session, new: true }
      );

      if (!flashcard) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard not found"
        );
      }

      return flashcard;
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

  async deleteFlashcard(
    id: string,
    session?: ClientSession
  ): Promise<IFlashcard | null> {
    try {
      const flashcard = await FlashcardModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), isDeleted: false },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      if (!flashcard) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard not found"
        );
      }

      return flashcard;
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

  async getFlashcard(id: string): Promise<IFlashcard | null> {
    try {
      const flashcard = await FlashcardModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      }).lean();

      if (!flashcard) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard not found"
        );
      }

      return flashcard;
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

  async getFlashcards(
    flashcardSetId: string,
    query: IQuery
  ): Promise<IPagination> {
    type SearchQuery = {
      flashcardSetId: mongoose.Types.ObjectId;
      isDeleted?: boolean;
      $or?: [
        { vietnameseContent?: { $regex: string; $options: string } },
        { englishContent?: { $regex: string; $options: string } }
      ];
    };

    try {
      const matchQuery: SearchQuery = {
        flashcardSetId: new mongoose.Types.ObjectId(flashcardSetId),
        isDeleted: false,
      };

      if (query.search) {
        matchQuery["$or"] = [
          { vietnameseContent: { $regex: query.search, $options: "i" } },
          { englishContent: { $regex: query.search, $options: "i" } },
        ];
      }

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;
        default:
          break;
      }

      const skip = (query.page - 1) * query.size;
      const flashcards = await FlashcardModel.aggregate([
        {
          $match: matchQuery,
        },
        { $sort: { order: 1, [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const totalCount = await FlashcardModel.countDocuments(matchQuery);

      return {
        data: flashcards,
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

  async getFlashcardOrder(flashcardSetId: string): Promise<number> {
    try {
      const flashcards = await FlashcardModel.find({
        flashcardflashcardSetId: new mongoose.Types.ObjectId(flashcardSetId),
        isDeleted: false,
      }).sort({ order: -1 });

      if (flashcards.length === 0) {
        return 1;
      }
      return flashcards[0].order + 1;
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

  async deleteBatchFlashcards(
    flashcardSetId: string,
    session?: mongoose.ClientSession
  ): Promise<number> {
    try {
      const logger = getLogger("FLASHCARD");
      const result = await FlashcardModel.updateMany(
        {
          flashcardSetId: new mongoose.Types.ObjectId(flashcardSetId),
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
        { session }
      );
      logger.info(
        `Deleted ${result.modifiedCount} flashcard has flashcard set Id: ${flashcardSetId}`
      );
      return result.modifiedCount;
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
export default FlashcardRepository;
