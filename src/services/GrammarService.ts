import { Inject, Service } from "typedi";
import { IGrammar } from "../interfaces/models/IGrammar";
import { IGrammarService } from "../interfaces/services/IGrammarService";
import { IGrammarRepository } from "../interfaces/repositories/IGrammarRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import GrammarRepository from "../repositories/GrammarRepository";
import LessonRepository from "../repositories/LessonRepository";
import Database from "../db/database";
import mongoose from "mongoose";

@Service()
class GrammarService implements IGrammarService {
  constructor(
    @Inject(() => GrammarRepository)
    private grammarRepository: IGrammarRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject() private database: Database
  ) {}

  async createGrammar(
    lessonId: string,
    title: string,
    structure: string,
    example: string | undefined,
    explanation: string | undefined,
    order: number
  ): Promise<IGrammar> {
    const session = await this.database.startTransaction();
    try {
      // Validate lessonId
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Lesson with ID ${lessonId} not found`
        );
      }

      // Check for duplicate title within the same lesson
      const existingGrammar = await this.grammarRepository.getGrammars({
        lessonId,
        title,
        page: 1,
        size: 1,
      } as IQuery);
      if (existingGrammar.data.length > 0) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          `Grammar with title "${title}" already exists for this lesson`
        );
      }

      const grammar = await this.grammarRepository.createGrammar(
        {
          lessonId: new mongoose.Types.ObjectId(lessonId),
          title,
          structure,
          example,
          explanation,
          order,
        },
        session
      );

      await this.database.commitTransaction(session);
      return grammar;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create grammar"
      );
    }
  }

  async updateGrammar(
    grammarId: string,
    lessonId: string | undefined,
    title: string | undefined,
    structure: string | undefined,
    example: string | undefined,
    explanation: string | undefined,
    order: number | undefined
  ): Promise<IGrammar | null> {
    const session = await this.database.startTransaction();
    try {
      // Validate grammar exists
      const grammar = await this.grammarRepository.getGrammarById(grammarId);
      if (!grammar) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Grammar not found"
        );
      }

      // Validate lessonId if provided
      if (lessonId) {
        const lesson = await this.lessonRepository.getLessonById(lessonId);
        if (!lesson) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            `Lesson with ID ${lessonId} not found`
          );
        }
      }

      // Check for duplicate title within the same lesson if title is updated
      if (title && lessonId) {
        const existingGrammar = await this.grammarRepository.getGrammars({
          lessonId,
          title,
          page: 1,
          size: 1,
        } as IQuery);
        if (
          existingGrammar.data.length > 0 &&
          existingGrammar.data[0]._id.toString() !== grammarId
        ) {
          throw new CustomException(
            StatusCodeEnum.Conflict_409,
            `Another grammar with title "${title}" already exists for this lesson`
          );
        }
      }

      const updateData: Partial<IGrammar> = {
        ...(lessonId && {
          lessonId: new mongoose.Schema.Types.ObjectId(lessonId),
        }),
        ...(title && { title }),
        ...(structure && { structure }),
        ...(example !== undefined && { example }),
        ...(explanation !== undefined && { explanation }),
        ...(order !== undefined && { order }),
      };

      const updatedGrammar = await this.grammarRepository.updateGrammar(
        grammarId,
        updateData,
        session
      );
      if (!updatedGrammar) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Grammar not found"
        );
      }

      await this.database.commitTransaction(session);
      return updatedGrammar;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update grammar"
      );
    }
  }

  async deleteGrammar(grammarId: string): Promise<IGrammar | null> {
    const session = await this.database.startTransaction();
    try {
      const grammar = await this.grammarRepository.getGrammarById(grammarId);
      if (!grammar) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Grammar not found"
        );
      }

      const deletedGrammar = await this.grammarRepository.deleteGrammar(
        grammarId,
        session
      );
      await this.database.commitTransaction(session);
      return deletedGrammar;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete grammar"
      );
    }
  }

  async getGrammarById(grammarId: string): Promise<IGrammar | null> {
    try {
      const grammar = await this.grammarRepository.getGrammarById(grammarId);
      if (!grammar) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Grammar not found"
        );
      }
      return grammar;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve grammar"
      );
    }
  }

  async getGrammars(query: IQuery): Promise<IPagination> {
    try {
      const grammars = await this.grammarRepository.getGrammars(query);
      return grammars;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
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
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const grammars = await this.grammarRepository.getGrammarsByLessonId(
        lessonId,
        query
      );
      return grammars;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve grammars"
      );
    }
  }
}

export default GrammarService;
