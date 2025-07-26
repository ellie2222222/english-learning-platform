import { Inject, Service } from "typedi";
import { IFlashcardService } from "../interfaces/services/IFlashcardService";
import { IFlashcard } from "../interfaces/models/IFlashcard";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import FlashcardRepository from "../repositories/FlashcardRepository";
import { IFlashcardRepository } from "../interfaces/repositories/IFlashcardRepository";
import FlashcardSetRepository from "../repositories/FlashcardSetRepository";
import { IFlashcardSetRepository } from "../interfaces/repositories/IFlashcardSetRepository";
import UserEnum from "../enums/UserEnum";

@Service()
class FlashcardService implements IFlashcardService {
  constructor(
    @Inject() private database: Database,
    @Inject(() => FlashcardRepository)
    private flashcardRepository: IFlashcardRepository,
    @Inject(() => FlashcardSetRepository)
    private flashcardSetRepository: IFlashcardSetRepository
  ) {}

  createFlashcard = async (
    userId: string,
    englishContent: string,
    vietnameseContent: string,
    flashcardSetId: string
  ): Promise<IFlashcard | null> => {
    const session = await this.database.startTransaction();
    try {
      const flashcardSet = await this.flashcardSetRepository.getFlashcardSet(
        flashcardSetId
      );

      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      if (flashcardSet.userId.toString() !== userId) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not the author of this flashcard set and cannot create flashcards in it"
        );
      }

      const order = await this.flashcardRepository.getFlashcardOrder(
        flashcardSetId
      );
      const flashcard = await this.flashcardRepository.createFlashcard(
        {
          englishContent: englishContent.trim(),
          vietnameseContent: vietnameseContent.trim(),
          flashcardSetId: flashcardSetId,
          order: order,
        },
        session
      );
      await session.commitTransaction(session);

      return flashcard;
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

  updateFlashcard = async (
    id: string,
    userId: string,
    englishContent?: string,
    vietnameseContent?: string
  ): Promise<IFlashcard | null> => {
    const session = await this.database.startTransaction();
    try {
      const flashcard = await this.flashcardRepository.getFlashcard(id);
      if (!flashcard) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard not found"
        );
      }

      const flashcardSet = await this.flashcardSetRepository.getFlashcardSet(
        flashcard.flashcardSetId.toString()
      );

      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      if (flashcardSet.userId.toString() !== userId) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not the author of this flashcard set and cannot update this flashcard"
        );
      }

      const data: Partial<IFlashcard> = {};
      if (
        englishContent &&
        englishContent.trim() !== flashcard.englishContent
      ) {
        data.englishContent = englishContent;
      }
      if (
        vietnameseContent &&
        vietnameseContent.trim() !== flashcard.vietnameseContent
      ) {
        data.vietnameseContent = vietnameseContent;
      }

      const updatedFlashcard = await this.flashcardRepository.updateFlashcard(
        id,
        data,
        session
      );
      await session.commitTransaction(session);

      return updatedFlashcard;
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

  deleteFlashcard = async (
    id: string,
    userId: string,
    userRole?: number
  ): Promise<IFlashcard | null> => {
    const session = await this.database.startTransaction();
    try {
      const flashcard = await this.flashcardRepository.getFlashcard(id);

      if (!flashcard) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard not found"
        );
      }

      const flashcardSet = await this.flashcardSetRepository.getFlashcardSet(
        flashcard.flashcardSetId.toString()
      );
      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      // Allow admins to delete any flashcard, otherwise check ownership
      if (
        userRole !== UserEnum.ADMIN &&
        flashcardSet.userId.toString() !== userId
      ) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not the author of this flashcard set and cannot delete this flashcard"
        );
      }

      const deletedFlashcard = await this.flashcardRepository.deleteFlashcard(
        id
      );
      await session.commitTransaction(session);
      return deletedFlashcard;
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

  getFlashcards = async (
    flashcardSetId: string,
    query: IQuery
  ): Promise<IPagination> => {
    try {
      const flashcardSet = await this.flashcardSetRepository.getFlashcardSet(
        flashcardSetId
      );

      if (!flashcardSet) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Flashcard set not found"
        );
      }

      const flashcards = await this.flashcardRepository.getFlashcards(
        flashcardSetId,
        query
      );

      return flashcards;
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

  getFlashcard = async (id: string): Promise<IFlashcard | null> => {
    try {
      const flashcard = await this.flashcardRepository.getFlashcard(id);

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
  };
}

export default FlashcardService;
