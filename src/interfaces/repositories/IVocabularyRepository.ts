import mongoose from "mongoose";
import { IVocabulary } from "../models/IVocabulary";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";


export interface IVocabularyRepository {
  createVocabulary(vocabulary: Partial<IVocabulary>, session?: mongoose.ClientSession): Promise<IVocabulary>;

  updateVocabulary(vocabularyId: string, updateData: Partial<IVocabulary>, session?: mongoose.ClientSession): Promise<IVocabulary | null>;

  deleteVocabulary(vocabularyId: string, session?: mongoose.ClientSession): Promise<IVocabulary | null>;

  getVocabularyById(vocabularyId: string): Promise<IVocabulary | null>;

  getVocabularies(query: IQuery): Promise<IPagination>;
  
  getVocabulariesByLessonId(lessonId: string, query: IQuery): Promise<IPagination>;

  deleteVocabularyByLessonId(lessonId: string, session?: mongoose.ClientSession): Promise<boolean>;
}