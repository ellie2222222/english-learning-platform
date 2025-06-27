import { IVocabulary } from "../models/IVocabulary";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IVocabularyService {
  createVocabulary(
    lessonId: string,
    englishContent: string,
    vietnameseContent: string,
    imageUrl: string | undefined
  ): Promise<IVocabulary>;

  updateVocabulary(
    vocabularyId: string,
    lessonId: string | undefined,
    englishContent: string | undefined,
    vietnameseContent: string | undefined,
    imageUrl: string | undefined
  ): Promise<IVocabulary | null>;

  deleteVocabulary(vocabularyId: string): Promise<IVocabulary | null>;

  getVocabularyById(
    vocabularyId: string,
    userId: string
  ): Promise<IVocabulary | null>;

  getVocabularies(query: IQuery, userId: string): Promise<IPagination>;

  getVocabulariesByLessonId(
    lessonId: string,
    query: IQuery,
    userId: string
  ): Promise<IPagination>;
}
