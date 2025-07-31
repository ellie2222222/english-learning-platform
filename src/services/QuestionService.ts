import { Inject, Service } from "typedi";
import { IQuestionService } from "../interfaces/services/IQuestionService";
import QuestionRepository from "../repositories/QuestionRepository";
import { IQuestionRepository } from "../interfaces/repositories/IQuestionRepository";
import { IQuestion } from "../interfaces/models/IQuestion";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import Database from "../db/database";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import LessonRepository from "../repositories/LessonRepository";
import { ILessonRepository } from "../interfaces/repositories/ILessonRepository";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import { cleanUpFile } from "../utils/fileUtils";
import mongoose from "mongoose";
import { LessonTrackingType } from "../enums/LessonTrackingTypeEnum";

@Service()
class QuestionService implements IQuestionService {
  constructor(
    @Inject(() => LessonRepository)
    private lessonRepository: ILessonRepository,
    @Inject(() => QuestionRepository)
    private questionRepository: IQuestionRepository,
    @Inject() private database: Database
  ) {}

  private arraysEqual(
    a: string | string[] | undefined,
    b: string | string[] | undefined
  ): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a === "string" && typeof b === "string") return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((val, index) => val === b[index]);
    }
    return false;
  }

  createQuestion = async (
    lessonId: string,
    type: string,
    question: string,
    answer: string | string[],
    focus: string,
    options?: string[],
    explanation?: string,
    image?: string
  ): Promise<IQuestion | null> => {
    const session = await this.database.startTransaction();
    try {
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (!lesson) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Lesson not found"
        );
      }

      const order = await this.questionRepository.getQuestionOrder(lessonId);

      const questionData = await this.questionRepository.createQuestion(
        {
          lessonId: new mongoose.Types.ObjectId(lessonId),
          type,
          question,
          answer: Array.isArray(answer) ? answer : [answer],
          focus,
          options,
          explanation,
          image,
          order,
        },
        session
      );

      // Update lesson length
      const updatedLength = [...lesson.length];
      const idx = updatedLength.findIndex(
        (item) => item.for === LessonTrackingType.EXERCISE
      );
      if (idx !== -1) {
        updatedLength[idx].amount += 1;
      } else {
        updatedLength.push({ for: LessonTrackingType.EXERCISE, amount: 1 });
      }
      await this.lessonRepository.updateLesson(
        lessonId,
        { length: updatedLength },
        session
      );

      await this.database.commitTransaction(session);
      return questionData;
    } catch (error) {
      await session.abortTransaction(session);

      if (image) {
        await cleanUpFile(image, "create");
      }
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

  updateQuestion = async (
    id: string,
    question: string,
    answer: string | string[],
    focus: string,
    options?: string[],
    explanation?: string,
    image?: string
  ): Promise<IQuestion | null> => {
    const session = await this.database.startTransaction();
    try {
      const checkQuestion = await this.questionRepository.getQuestion(id);
      let cleanUpImage = false;
      if (!checkQuestion) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Question not found"
        );
      }

      // Validate answer based on question type
      if (answer !== undefined || options !== undefined) {
        const checkOptions = options ?? checkQuestion.options;
        const checkAnswer = answer ?? checkQuestion.answer;

        if (checkQuestion.type === ExerciseTypeEnum.MULTIPLE_CHOICE) {
          if (
            !Array.isArray(checkAnswer) ||
            checkAnswer.length !== 1 ||
            typeof checkAnswer[0] !== "string" ||
            (checkOptions && checkOptions.indexOf(checkAnswer[0]) === -1)
          ) {
            throw new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Answer must be an array with one valid option for multiple choice"
            );
          }

          if (options) {
            if (
              !Array.isArray(options) ||
              options.length === 0 ||
              options.some((opt) => typeof opt !== "string" || !opt)
            ) {
              throw new CustomException(
                StatusCodeEnum.BadRequest_400,
                "Options must be a non-empty array of strings"
              );
            }
          }
        } else if (
          [
            ExerciseTypeEnum.IMAGE_TRANSLATE,
            ExerciseTypeEnum.FILL_IN_THE_BLANK,
            ExerciseTypeEnum.TRANSLATE,
          ].indexOf(checkQuestion.type) !== -1
        ) {
          if (
            !Array.isArray(checkAnswer) ||
            checkAnswer.length === 0 ||
            checkAnswer.some((ans) => typeof ans !== "string" || !ans)
          ) {
            throw new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Answer must be a non-empty array of strings"
            );
          }
        }
      }

      const data: Partial<IQuestion> = {};
      if (question && question !== checkQuestion.question)
        data.question = question;
      if (
        answer !== undefined &&
        !this.arraysEqual(answer, checkQuestion.answer)
      ) {
        data.answer =
          checkQuestion.type === ExerciseTypeEnum.MULTIPLE_CHOICE &&
          typeof answer === "string"
            ? [answer]
            : Array.isArray(answer) ? answer : [answer];
      }
      if (focus && focus !== checkQuestion.focus) data.focus = focus;
      if (
        options &&
        checkQuestion.type === ExerciseTypeEnum.MULTIPLE_CHOICE &&
        !this.arraysEqual(options, checkQuestion.options)
      ) {
        data.options = options;
      }
      if (explanation && explanation !== checkQuestion.explanation) {
        data.explanation = explanation;
      }
      if (
        image &&
        checkQuestion.type === ExerciseTypeEnum.IMAGE_TRANSLATE &&
        image !== checkQuestion.image
      ) {
        if (checkQuestion.image) {
          data.image = image;
          cleanUpImage = true;
        } else {
          data.image = image;
        }
      }

      const updatedQuestion = await this.questionRepository.updateQuestion(
        id,
        data,
        session
      );

      await this.database.commitTransaction(session);

      if (cleanUpImage) {
        await cleanUpFile(checkQuestion.image as string, "update");
      }

      return updatedQuestion;
    } catch (error) {
      await session.abortTransaction(session);

      if (image) {
        cleanUpFile(image, "create");
      }
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

  deleteQuestion = async (id: string): Promise<IQuestion | null> => {
    const session = await this.database.startTransaction();
    try {
      const question = await this.questionRepository.getQuestion(id);
      if (!question) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Question not found"
        );
      }

      const deletedQuestion = await this.questionRepository.deleteQuestion(
        id,
        session
      );

      // Update lesson length
      const lessonId = question.lessonId.toString();
      const lesson = await this.lessonRepository.getLessonById(lessonId);
      if (lesson) {
        const updatedLength = [...lesson.length];
        const idx = updatedLength.findIndex(
          (item) => item.for === LessonTrackingType.EXERCISE
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
      }

      await this.database.commitTransaction(session);
      return deletedQuestion;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  getQuestions = async (
    query: IQuery,
    lessonId: string
  ): Promise<IPagination> => {
    try {
      const questions = await this.questionRepository.getQuestions(
        query,
        lessonId
      );
      return questions;
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

  getQuestion = async (id: string): Promise<IQuestion | null> => {
    try {
      const question = await this.questionRepository.getQuestion(id);
      return question;
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

export default QuestionService; 