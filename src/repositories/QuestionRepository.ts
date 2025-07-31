import { Inject, Service } from "typedi";
import { IQuestionRepository } from "../interfaces/repositories/IQuestionRepository";
import QuestionModel from "../models/QuestionModel";
import { IQuestion } from "../interfaces/models/IQuestion";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import mongoose from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";

@Service()
class QuestionRepository implements IQuestionRepository {
  async createQuestion(
    data: Partial<IQuestion>,
    session?: mongoose.ClientSession
  ): Promise<IQuestion | null> {
    try {
      const question = new QuestionModel(data);
      return await question.save({ session });
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create question"
      );
    }
  }

  async updateQuestion(
    id: string,
    data: Partial<IQuestion>,
    session?: mongoose.ClientSession
  ): Promise<IQuestion | null> {
    try {
      const question = await QuestionModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, session }
      );
      return question;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update question"
      );
    }
  }

  async deleteQuestion(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IQuestion | null> {
    try {
      const question = await QuestionModel.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        { new: true, session }
      );
      return question;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete question"
      );
    }
  }

  async getQuestion(id: string): Promise<IQuestion | null> {
    try {
      const question = await QuestionModel.findOne({
        _id: id,
        isDeleted: { $ne: true },
      });
      return question;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to get question"
      );
    }
  }

  async getQuestions(
    query: IQuery,
    lessonId?: string
  ): Promise<IPagination> {
    try {
      const { page = 1, size = 10, search, sortBy, order } = query;
      const skip = (page - 1) * size;

      const matchQuery: any = { isDeleted: { $ne: true } };
      if (lessonId) {
        matchQuery.lessonId = new mongoose.Types.ObjectId(lessonId);
      }
      if (search) {
        matchQuery.question = { $regex: search, $options: "i" };
      }

      const sortQuery: any = {};
      if (sortBy) {
        sortQuery[sortBy] = order === "desc" ? -1 : 1;
      }
      sortQuery.order = 1; // Default sort by order

      const questions = await QuestionModel.find(matchQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(size);

      const total = await QuestionModel.countDocuments(matchQuery);

      return {
        data: questions,
        total,
        page,
        totalPages: Math.ceil(total / size),
      };
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to get questions"
      );
    }
  }

  async getQuestionsByLessonId(lessonId: string): Promise<IQuestion[]> {
    try {
      const questions = await QuestionModel.find({
        lessonId: new mongoose.Types.ObjectId(lessonId),
        isDeleted: { $ne: true },
      }).sort({ order: 1 });
      return questions;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to get questions by lesson ID"
      );
    }
  }

  async getQuestionsByLessonIds(lessonIds: string[]): Promise<IQuestion[]> {
    try {
      const questions = await QuestionModel.find({
        lessonId: { $in: lessonIds.map(id => new mongoose.Types.ObjectId(id)) },
        isDeleted: { $ne: true },
      }).sort({ order: 1 });
      return questions;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to get questions by lesson IDs"
      );
    }
  }

  async getQuestionsForTest(
    totalQuestions: number,
    lessonIds: mongoose.Types.ObjectId[]
  ): Promise<IQuestion[]> {
    try {
      const questions = await QuestionModel.aggregate([
        {
          $match: {
            lessonId: { $in: lessonIds },
            isDeleted: { $ne: true },
          },
        },
        { $sort: { order: 1 } },
        { $limit: totalQuestions },
      ]);
      return questions;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to get questions for test"
      );
    }
  }

  async getQuestionOrder(lessonId: string): Promise<number> {
    try {
      const lastQuestion = await QuestionModel.findOne({
        lessonId: new mongoose.Types.ObjectId(lessonId),
        isDeleted: { $ne: true },
      }).sort({ order: -1 });
      return lastQuestion ? lastQuestion.order + 1 : 1;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to get question order"
      );
    }
  }

  async countQuestionsByLessonIds(lessonIds: string[]): Promise<number> {
    try {
      const count = await QuestionModel.countDocuments({
        lessonId: { $in: lessonIds.map(id => new mongoose.Types.ObjectId(id)) },
        isDeleted: { $ne: true },
      });
      return count;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to count questions"
      );
    }
  }

  async countDeletedQuestionsByLessonIds(lessonIds: string[]): Promise<number> {
    try {
      const count = await QuestionModel.countDocuments({
        lessonId: { $in: lessonIds.map(id => new mongoose.Types.ObjectId(id)) },
        isDeleted: true,
      });
      return count;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to count deleted questions"
      );
    }
  }
}

export default QuestionRepository; 