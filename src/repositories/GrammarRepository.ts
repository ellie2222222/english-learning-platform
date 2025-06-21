import { Service } from "typedi";
import mongoose, { Model } from "mongoose";
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
    updateData: Partial<IGrammar>,
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
          { $sort: { [sortField]: sortOrder } },
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
          { $sort: { [sortField]: sortOrder } },
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
}

export default GrammarRepository;
