import { Inject, Service } from "typedi";
import { IFlashcardSetService } from "../interfaces/services/IFlashcardSetService";
import { IFlashcardSet } from "../interfaces/models/IFlashcardSet";
import { IPagination } from "../interfaces/others/IPagination";
import { IQuery } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import FlashcardSetRepository from "../repositories/FlashcardSetRepository";
import { IFlashcardSetRepository } from "../interfaces/repositories/IFlashcardSetRepository";
import Database from "../db/database";
import { ObjectId } from "mongoose";
import getLogger from "../utils/logger";
import FlashcardRepository from "../repositories/FlashcardRepository";
import { IFlashcardRepository } from "../interfaces/repositories/IFlashcardRepository";

@Service()
class FlashcardSetService implements IFlashcardSetService {
  constructor(
    @Inject(() => FlashcardSetRepository)
    private flashcardSetRepository: IFlashcardSetRepository,
    @Inject() private database: Database,
    @Inject(() => FlashcardRepository)
    private flashcardRepository: IFlashcardRepository
  ) {}

  createFlashcardSet = async (
    name: string,
    userId: string,
    description?: string
  ): Promise<IFlashcardSet | null> => {
    const session = await this.database.startTransaction();
    try {
      const checkFlashcardSet =
        await this.flashcardSetRepository.getFlashcardSetByName(name);

      if (checkFlashcardSet) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Flashcard set already exists"
        );
      }
      const flashcardSet = await this.flashcardSetRepository.createFlashcardSet(
        { name, description, userId },
        session
      );

      await session.commitTransaction(session);

      return flashcardSet;
    } catch (error) {
      await session.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  updateFlashcardSet = async (
    id: string,
    userId: string,
    name?: string,
    description?: string
  ): Promise<IFlashcardSet | null> => {
    const session = await this.database.startTransaction();
    try {
      const flashcardSet = await this.flashcardSetRepository.getFlashcardSet(
        id
      );

      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      if ((flashcardSet.userId as ObjectId).toString() !== userId) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have permission to update this flashcard set"
        );
      }

      if (name && name !== flashcardSet.name) {
        const checkFlashcardSet =
          await this.flashcardSetRepository.getFlashcardSetByName(name, id);

        if (checkFlashcardSet) {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Flashcard set with this name already exists"
          );
        }
      }

      const updatedFlashcardSet =
        await this.flashcardSetRepository.updateFlashcardSet(
          id,
          { name, description, userId },
          session
        );

      await session.commitTransaction(session);

      return updatedFlashcardSet;
    } catch (error) {
      await session.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  deleteFlashcardSet = async (
    id: string,
    userId: string
  ): Promise<IFlashcardSet | null> => {
    const session = await this.database.startTransaction();
    try {
      const flashcardSet = await this.flashcardSetRepository.getFlashcardSet(
        id
      );

      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      if ((flashcardSet.userId as ObjectId).toString() !== userId) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have permission to delete this flashcard set"
        );
      }

      const deletedFlashcardSet =
        await this.flashcardSetRepository.deleteFlashcardSet(id, session);

      await this.flashcardRepository.deleteBatchFlashcards(id, session);

      await session.commitTransaction(session);

      return deletedFlashcardSet;
    } catch (error) {
      await session.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  getFlashcardSet = async (id: string): Promise<IFlashcardSet | null> => {
    try {
      const flashcardSet = await this.flashcardSetRepository.getFlashcardSet(
        id
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
  };

  getFlashcardSets = async (
    query: IQuery,
    userId?: string
  ): Promise<IPagination> => {
    try {
      const flashcardSets = await this.flashcardSetRepository.getFlashcardSets(
        query,
        userId
      );

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
  };

  async getFlashcardSetsByUserId(userId: string): Promise<IFlashcardSet[]> {
    try {
      const flashcardSets = await this.flashcardSetRepository.getFlashcardSetsByUserId(userId);
      return flashcardSets;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Failed to get flashcard sets"
      );
    }
  }
}

export default FlashcardSetService;
