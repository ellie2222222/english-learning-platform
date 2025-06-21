import { Service } from "typedi";
import mongoose, { ClientSession, Model, Types } from "mongoose";
import { IVocabulary } from "../interfaces/models/IVocabulary";
import { IVocabularyRepository } from "../interfaces/repositories/IVocabularyRepository";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import VocabularyModel from "../models/VocabularyModel";

@Service()
class VocabularyRepository implements IVocabularyRepository {
  private vocabularyModel: Model<IVocabulary>;

  constructor() {
    this.vocabularyModel = VocabularyModel;
  }

  async createVocabulary(
    vocabulary: object,
    session?: any
  ): Promise<IVocabulary> {
    try {
      const newVocabulary = await this.vocabularyModel.create([vocabulary], {
        session,
      });
      return newVocabulary[0];
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create vocabulary"
      );
    }
  }

  async updateVocabulary(
    vocabularyId: string,
    updateData: object,
    session?: mongoose.ClientSession
  ): Promise<IVocabulary | null> {
    try {
      const updatedVocabulary = await this.vocabularyModel
        .findByIdAndUpdate(vocabularyId, updateData, { new: true, session })
        .exec();
      return updatedVocabulary;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update vocabulary"
      );
    }
  }

  async deleteVocabulary(
    vocabularyId: string,
    session?: mongoose.ClientSession
  ): Promise<IVocabulary | null> {
    try {
      const deletedVocabulary = await this.vocabularyModel
        .findByIdAndUpdate(
          vocabularyId,
          { isDeleted: true },
          { new: true, session }
        )
        .exec();
      return deletedVocabulary;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete vocabulary"
      );
    }
  }

  async getVocabularyById(vocabularyId: string): Promise<IVocabulary | null> {
    try {
      const vocabulary = await this.vocabularyModel
        .findOne({ _id: vocabularyId, isDeleted: false })
        .exec();
      return vocabulary;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve vocabulary"
      );
    }
  }

  async getVocabularies(query: IQuery): Promise<IPagination> {
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

      const vocabularies = await this.vocabularyModel
        .aggregate([
          { $match: matchQuery },
          { $sort: { [sortField]: sortOrder } },
          { $skip: skip },
          { $limit: query.size },
        ])
        .exec();

      const total = await this.vocabularyModel.countDocuments(matchQuery);

      return {
        data: vocabularies,
        page: query.page,
        total,
        totalPages: Math.ceil(total / query.size),
      };
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve vocabularies"
      );
    }
  }

  async getVocabulariesByLessonId(
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

      const vocabularies = await this.vocabularyModel
        .aggregate([
          { $match: matchQuery },
          { $sort: { [sortField]: sortOrder } },
          { $skip: skip },
          { $limit: query.size },
        ])
        .exec();

      const total = await this.vocabularyModel.countDocuments(matchQuery);

      return {
        data: vocabularies,
        page: query.page,
        total,
        totalPages: Math.ceil(total / query.size),
      };
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve vocabularies"
      );
    }
  }

  async deleteVocabularyByLessonId(
    lessonId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      const result = await this.vocabularyModel.updateMany(
        { lessonId: new mongoose.Types.ObjectId(lessonId) },
        { isDeleted: true },
        { session }
      );

      if (result.modifiedCount === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No vocabulary found for the provided lesson ID"
        );
      }

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

  async deleteVocabularyByLessonIds(
    lessonIds: Types.ObjectId[],
    session?: ClientSession
  ): Promise<boolean> {
    try {
      const result = await this.vocabularyModel.updateMany(
        {
          lessonId: {
            $in: lessonIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
        { isDeleted: true },
        { session }
      );

      if (result.modifiedCount === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No vocabulary found for the provided lesson IDs"
        );
      }

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
}

export default VocabularyRepository;
