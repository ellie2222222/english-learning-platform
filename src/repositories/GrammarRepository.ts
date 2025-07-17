import { Service } from "typedi";
import mongoose, { ClientSession, Model } from "mongoose";
import { IGrammar } from "../interfaces/models/IGrammar";
import { IGrammarRepository } from "../interfaces/repositories/IGrammarRepository";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import GrammarModel from "../models/GrammarModel";

@Service()
class GrammarRepository implements IGrammarRepository {
  private grammarModel: Model<IGrammar>;

  constructor() {
    this.grammarModel = GrammarModel;
  }

  async createGrammar(grammar: object, session?: any): Promise<IGrammar> {
    try {
      const newGrammar = await this.grammarModel.create([grammar], { session });
      return newGrammar[0];
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create grammar"
      );
    }
  }

  async updateGrammar(
    grammarId: string,
    updateData: object,
    session?: any
  ): Promise<IGrammar | null> {
    try {
      const updatedGrammar = await this.grammarModel
        .findByIdAndUpdate(grammarId, updateData, { new: true, session })
        .exec();
      return updatedGrammar;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update grammar"
      );
    }
  }

  async deleteGrammar(
    grammarId: string,
    session?: any
  ): Promise<IGrammar | null> {
    try {
      const deletedGrammar = await this.grammarModel
        .findByIdAndUpdate(
          grammarId,
          { isDeleted: true },
          { new: true, session }
        )
        .exec();
      return deletedGrammar;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete grammar"
      );
    }
  }

  async getGrammarById(grammarId: string): Promise<IGrammar | null> {
    try {
      const grammar = await this.grammarModel
        .findOne({ _id: grammarId, isDeleted: false })
        .exec();
      return grammar;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve grammar"
      );
    }
  }

  async getGrammars(query: IQuery): Promise<IPagination> {
    try {
      const matchQuery = { isDeleted: false };
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

      const grammars = await this.grammarModel
        .aggregate([
          { $match: matchQuery },
          { $sort: { order: 1, [sortField]: sortOrder } },
          { $skip: skip },
          { $limit: query.size },
        ])
        .exec();

      const total = await this.grammarModel.countDocuments(matchQuery);

      return {
        data: grammars,
        page: query.page,
        total,
        totalPages: Math.ceil(total / query.size),
      };
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve grammars"
      );
    }
  }

  async getGrammarsByLessonId(
    lessonId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const matchQuery = {
        lessonId: new mongoose.Types.ObjectId(lessonId),
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

      const grammars = await this.grammarModel
        .aggregate([
          { $match: matchQuery },
          { $sort: { order: 1, [sortField]: sortOrder } },
          { $skip: skip },
          { $limit: query.size },
        ])
        .exec();

      const total = await this.grammarModel.countDocuments(matchQuery);

      return {
        data: grammars,
        page: query.page,
        total,
        totalPages: Math.ceil(total / query.size),
      };
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve grammars"
      );
    }
  }

  async deleteGrammarByLessonId(
    lessonId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      const result = await this.grammarModel.updateMany(
        { lessonId: new mongoose.Types.ObjectId(lessonId) },
        { $set: { isDeleted: true } },
        { session }
      );

      return result.acknowledged;
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

  async deleteGrammarByLessonIds(
    lessonIds: mongoose.Types.ObjectId[],
    session?: ClientSession
  ): Promise<boolean> {
    try {
      const result = await this.grammarModel.updateMany(
        { lessonId: { $in: lessonIds } },
        { $set: { isDeleted: true } },
        { session }
      );

      return result.acknowledged;
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

  async getLessonIdByGrammarId(grammarId: string): Promise<string | null> {
    try {
      const lessonId = await this.grammarModel
        .findOne({ _id: grammarId, isDeleted: false })
        .select("lessonId")
        .exec();
      return lessonId?.lessonId as string | null;
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

  async getGrammarOrder(lessonId: string): Promise<number> {
    try {
      const grammar = await this.grammarModel
        .findOne({ lessonId, isDeleted: false })
        .sort({ order: -1 })
        .exec();
      return grammar?.order || 0;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async checkExistingGrammar(
    lessonId: string,
    title: string,
    currentId?: string
  ): Promise<IGrammar | null> {
    try {
      const normalized = title.trim().replace(/\s+/g, " ");
      const matchQuery: any = {
        lessonId: new mongoose.Types.ObjectId(lessonId),
        title: {
          $regex: `^${normalized}$`,
          $options: "i",
        },
        isDeleted: false,
      };

      if (currentId) {
        matchQuery["_id"] = { $ne: new mongoose.Types.ObjectId(currentId) };
      }

      const grammar = await GrammarModel.findOne(matchQuery);
      return grammar;
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

  async getAllGrammarsByLessonId(lessonId: string): Promise<IGrammar[]> {
    try {
      const grammars = await GrammarModel.find({
        lessonId: new mongoose.Types.ObjectId(lessonId),
        isDeleted: false,
      });

      return grammars;
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

export default GrammarRepository;
