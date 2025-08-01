import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import mongoose from "mongoose";
import { ExerciseTypeEnum } from "../enums/ExerciseTypeEnum";
import { ExerciseFocusEnum } from "../enums/ExerciseFocusEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class ExerciseDto {
  private validateObjectId(id: string): void {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(`Invalid ObjectId: ${id}`);
    }
  }

  createExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [key: string]: Express.Multer.File[] };

      const { lessonId, type, question, answer, focus, options, explanation } =
        req.body;

      if (
        !lessonId ||
        !type ||
        !question ||
        !answer ||
        !focus ||
        !explanation
      ) {
        throw new Error("Missing required fields");
      }

      if (!mongoose.isValidObjectId(lessonId)) {
        throw new Error("Invalid lessonId");
      }
      if (!Object.values(ExerciseFocusEnum).includes(focus)) {
        throw new Error("Invalid exercise focus");
      }
      if (!Object.values(ExerciseTypeEnum).includes(type)) {
        throw new Error("Invalid exercise type");
      }

      if (
        type === ExerciseTypeEnum.IMAGE_TRANSLATE &&
        !files.exerciseImage[0]
      ) {
        throw new Error("Missing image file for image translate exercise");
      }
      if (type === ExerciseTypeEnum.MULTIPLE_CHOICE) {
        if (
          !options ||
          !Array.isArray(options) ||
          options.some((opt: any) => typeof opt !== "string" || !opt)
        ) {
          console.log(typeof options);
          throw new Error(
            "Options must be a non-empty array of strings for multiple choice exercise"
          );
        }
        if (
          !Array.isArray(answer) ||
          answer.length !== 1 ||
          typeof answer[0] !== "string" ||
          !options.includes(answer[0])
        ) {
          throw new Error(
            "Answer must be an array with one valid option for multiple choice exercise"
          );
        }
      }

      if (
        [
          ExerciseTypeEnum.IMAGE_TRANSLATE,
          ExerciseTypeEnum.FILL_IN_THE_BLANK,
          ExerciseTypeEnum.TRANSLATE,
        ].includes(type)
      ) {
        if (
          !Array.isArray(answer) ||
          answer.length === 0 ||
          answer.some((ans: any) => typeof ans !== "string" || !ans)
        ) {
          throw new Error(
            "Answer must be a non-empty array of strings for this exercise type"
          );
        }
      }

      if (typeof question !== "string" || typeof explanation !== "string") {
        throw new Error("Question and explanation must be strings");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  updateExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { question, answer, focus, options, explanation } = req.body;

      if (!id) {
        throw new Error("Exercise ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid exercise ID");
      }

      if (focus && !Object.values(ExerciseFocusEnum).includes(focus)) {
        throw new Error("Invalid exercise focus");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  deleteExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Exercise ID is required");
      }
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid exercise ID");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  getExercises = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.id;
      const { page, size, order, sortBy } = req.query;

      if (
        page &&
        (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)
      ) {
        throw new Error("Invalid page number");
      }
      if (
        size &&
        (isNaN(parseInt(size as string)) || parseInt(size as string) < 1)
      ) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }
      if (lessonId && !mongoose.isValidObjectId(lessonId)) {
        throw new Error("Invalid lesson ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  getExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Exercise ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid exercise ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  submitExercise = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, answers } = req.body;

      this.validateObjectId(id);

      if (!userId || !answers) {
        throw new Error(
          "Missing required fields: userId, answers, and description are required"
        );
      }

      this.validateObjectId(userId);

      if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error("Please provide at least one answer.");
      }

      answers.forEach((answer: any, index: number) => {
        if (!answer.exerciseId || !answer.selectedAnswers) {
          throw new Error(
            `Answer #${index + 1} is missing required information.`
          );
        }

        this.validateObjectId(answer.exerciseId);

        if (
          !Array.isArray(answer.selectedAnswers) ||
          answer.selectedAnswers.length === 0
        ) {
          throw new Error(
            `Please select at least one answer for question #${index + 1}.`
          );
        }

        answer.selectedAnswers = answer.selectedAnswers
          .map((ans: any) => {
            if (typeof ans !== "string") return "";

            return ans.replace(/\s[^\w\s]$/, "").trim();
          })
          .filter((ans: string) => ans.length > 0);
      });

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  submitExercises = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params; // lessonId
      const { userId, answers } = req.body;

      this.validateObjectId(id);

      if (!userId || !answers) {
        throw new Error(
          "Missing required fields: userId and answers are required"
        );
      }

      this.validateObjectId(userId);

      if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error("Please provide at least one answer.");
      }

      answers.forEach((answer: any, index: number) => {
        if (!answer.exerciseId || !answer.selectedAnswers) {
          throw new Error(
            `Answer #${index + 1} is missing required information.`
          );
        }

        this.validateObjectId(answer.exerciseId);

        if (
          !Array.isArray(answer.selectedAnswers) ||
          answer.selectedAnswers.length === 0
        ) {
          throw new Error(
            `Please select at least one answer for question #${index + 1}.`
          );
        }

        answer.selectedAnswers = answer.selectedAnswers
          .map((ans: any) => {
            if (typeof ans !== "string") return "";

            return ans.replace(/\s[^\w\s]$/, "").trim();
          })
          .filter((ans: string) => ans.length > 0);
      });

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };
}

export default ExerciseDto;
