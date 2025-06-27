import { Inject, Service } from "typedi";
import mongoose, { ObjectId } from "mongoose";
import { IVocabulary } from "../interfaces/models/IVocabulary";
import { IVocabularyService } from "../interfaces/services/IVocabularyService";
import { IVocabularyRepository } from "../interfaces/repositories/IVocabularyRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import VocabularyRepository from "../repositories/VocabularyRepository";
import LessonRepository from "../repositories/LessonRepository";
import Database from "../db/database";
import { cleanUpFile } from "../utils/fileUtils";
import UserLessonRepository from "../repositories/UserLessonRepository";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

@Service()
class VocabularyService implements IVocabularyService {
  constructor(
    @Inject(() => VocabularyRepository)
    private vocabularyRepository: IVocabularyRepository,
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository,
    @Inject() private database: Database
  ) {}

  private updateUserLessonOrderIfNeeded = async (
    vocabularyId: string,
    userId: string,
    session: mongoose.ClientSession,
    order: number
  ): Promise<void> => {
    const lessonId = await this.vocabularyRepository.getLessonIdByVocabularyId(
      vocabularyId
    );
    if (!lessonId) {
      throw new CustomException(
        StatusCodeEnum.NotFound_404,
        "Lesson not found"
      );
    }

    const userLesson = await this.userLessonRepository.getExistingUserLesson(
      userId,
      lessonId
    );

    if (!userLesson) {
      throw new CustomException(
        StatusCodeEnum.NotFound_404,
        "User lesson not found"
      );
    }

    const currentOrderArr = [...(userLesson.currentOrder || [])];
    const idx = currentOrderArr.findIndex(
      (item) => item.for === LessonTrackingType.VOCABULARY
    );
    if (idx !== -1) {
      if (currentOrderArr[idx].order < order) {
        currentOrderArr[idx].order = order;
      }
    } else {
      currentOrderArr.push({ for: LessonTrackingType.VOCABULARY, order });
    }
    await this.userLessonRepository.updateUserLesson(
      (userLesson._id as ObjectId).toString(),
      { currentOrder: currentOrderArr },
      session
    );
  };

  async createVocabulary(
    lessonId: string,
    englishContent: string,
    vietnameseContent: string,
    imageUrl: string
  ): Promise<IVocabulary> {
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

      // Check for duplicate englishContent within the same lesson
      const existingVocabulary =
        await this.vocabularyRepository.getVocabularies({
          lessonId,
          englishContent,
          page: 1,
          size: 1,
        } as IQuery);
      if (existingVocabulary.data.length > 0) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          `Vocabulary with English content "${englishContent}" already exists for this lesson`
        );
      }

      const order =
        (await this.vocabularyRepository.getVocabularyOrder(lessonId)) + 1;

      const vocabulary = await this.vocabularyRepository.createVocabulary(
        {
          lessonId: new mongoose.Types.ObjectId(lessonId),
          englishContent,
          vietnameseContent,
          imageUrl,
          order,
        },
        session
      );

      if (imageUrl) {
        await cleanUpFile(imageUrl, "create");
      }

      //update lesson length
      const updatedLength = [...lesson.length];
      const idx = updatedLength.findIndex(
        (item) => item.for === LessonTrackingType.VOCABULARY
      );
      if (idx !== -1) {
        updatedLength[idx].amount += 1;
      } else {
        updatedLength.push({ for: LessonTrackingType.VOCABULARY, amount: 1 });
      }
      await this.lessonRepository.updateLesson(
        lessonId,
        { length: updatedLength },
        session
      );

      await this.database.commitTransaction(session);
      return vocabulary;
    } catch (error) {
      if (imageUrl) {
        await cleanUpFile(imageUrl, "create");
      }
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create vocabulary"
      );
    }
  }

  async updateVocabulary(
    vocabularyId: string,
    lessonId: string | undefined,
    englishContent: string | undefined,
    vietnameseContent: string | undefined,
    imageUrl: string | undefined
  ): Promise<IVocabulary | null> {
    const session = await this.database.startTransaction();
    try {
      // Validate vocabulary exists
      const vocabulary = await this.vocabularyRepository.getVocabularyById(
        vocabularyId
      );
      if (!vocabulary) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Vocabulary not found"
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

      // Check for duplicate englishContent within the same lesson if updated
      if (englishContent && (lessonId || vocabulary.lessonId)) {
        const targetLessonId = lessonId || vocabulary.lessonId.toString();
        const existingVocabulary =
          await this.vocabularyRepository.getVocabularies({
            lessonId: targetLessonId,
            englishContent,
            page: 1,
            size: 1,
          } as IQuery);
        if (
          existingVocabulary.data.length > 0 &&
          existingVocabulary.data[0]._id.toString() !== vocabularyId
        ) {
          throw new CustomException(
            StatusCodeEnum.Conflict_409,
            `Another vocabulary with English content "${englishContent}" already exists for this lesson`
          );
        }
      }

      const updateData: Partial<IVocabulary> = {
        ...(lessonId && {
          lessonId: new mongoose.Schema.Types.ObjectId(lessonId),
        }),
        ...(englishContent && { englishContent }),
        ...(vietnameseContent && { vietnameseContent }),
        ...(imageUrl !== undefined && { imageUrl }),
      };

      const updatedVocabulary =
        await this.vocabularyRepository.updateVocabulary(
          vocabularyId,
          updateData,
          session
        );
      if (!updatedVocabulary) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Vocabulary not found"
        );
      }

      // Clean up old image if a new one is provided
      if (imageUrl && vocabulary.imageUrl) {
        await cleanUpFile(vocabulary.imageUrl, "update");
      }

      // Clean up temporary file after successful update
      if (imageUrl) {
        await cleanUpFile(imageUrl, "create");
      }

      await this.database.commitTransaction(session);
      return updatedVocabulary;
    } catch (error) {
      // Clean up temporary file on error
      if (imageUrl) {
        await cleanUpFile(imageUrl, "create");
      }
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update vocabulary"
      );
    }
  }

  async deleteVocabulary(vocabularyId: string): Promise<IVocabulary | null> {
    const session = await this.database.startTransaction();
    try {
      const vocabulary = await this.vocabularyRepository.getVocabularyById(
        vocabularyId
      );
      if (!vocabulary) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Vocabulary not found"
        );
      }

      const deletedVocabulary =
        await this.vocabularyRepository.deleteVocabulary(vocabularyId, session);

      // Clean up image file on deletion
      if (vocabulary.imageUrl) {
        await cleanUpFile(vocabulary.imageUrl, "update");
      }

      //update lesson length
      const lessonId =
        await this.vocabularyRepository.getLessonIdByVocabularyId(vocabularyId);
      if (!lessonId) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const updatedLength = [...lesson.length];
      const idx = updatedLength.findIndex(
        (item) => item.for === LessonTrackingType.VOCABULARY
      );
      if (idx !== -1) {
        updatedLength[idx].amount =
          updatedLength[idx].amount - 1 < 0 ? 0 : updatedLength[idx].amount - 1;
      }
      await this.lessonRepository.updateLesson(
        lessonId,
        { length: updatedLength },
        session
      );

      await this.database.commitTransaction(session);
      return deletedVocabulary;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete vocabulary"
      );
    }
  }

  async getVocabularyById(
    vocabularyId: string,
    userId: string
  ): Promise<IVocabulary | null> {
    const session = await this.database.startTransaction();
    try {
      const vocabulary = await this.vocabularyRepository.getVocabularyById(
        vocabularyId
      );
      if (!vocabulary) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Vocabulary not found"
        );
      }

      await this.updateUserLessonOrderIfNeeded(
        vocabularyId,
        userId,
        session,
        vocabulary.order
      );

      await this.database.commitTransaction(session);
      return vocabulary;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve vocabulary"
      );
    }
  }

  async getVocabularies(query: IQuery, userId: string): Promise<IPagination> {
    const session = await this.database.startTransaction();
    try {
      const vocabularies = await this.vocabularyRepository.getVocabularies(
        query
      );

      if (vocabularies.data.length > 0) {
        await this.updateUserLessonOrderIfNeeded(
          vocabularies.data[0]._id.toString(),
          userId,
          session,
          vocabularies.data[0].order
        );
      }

      await this.database.commitTransaction(session);

      return vocabularies;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
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
    query: IQuery,
    userId: string
  ): Promise<IPagination> {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const vocabularies =
        await this.vocabularyRepository.getVocabulariesByLessonId(
          lessonId,
          query
        );

      if (vocabularies.data.length > 0) {
        await this.updateUserLessonOrderIfNeeded(
          vocabularies.data[0]._id.toString(),
          userId,
          session,
          vocabularies.data[0].order
        );
      }

      await this.database.commitTransaction(session);
      return vocabularies;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve vocabularies"
      );
    }
  }
}

export default VocabularyService;
