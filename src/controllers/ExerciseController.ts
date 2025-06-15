import { Inject, Service } from "typedi";
import ExerciseService from "../services/ExerciseService";
import { IExerciseService } from "../interfaces/services/IExerciseService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { formatPathSingle, uploadToCloudinary } from "../utils/fileUtils";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

@Service()
class ExerciseController {
  constructor(
    @Inject(() => ExerciseService) private exerciseService: IExerciseService
  ) {}

  createExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [key: string]: Express.Multer.File[] };

      let exerciseImage;

      const { lessonId, type, question, answer, focus, options, explanation } =
        req.body;

      if (process.env.STORAGE_TYPE === "cloudinary") {
        if (files && files.exerciseImage && files.exerciseImage.length > 0) {
          exerciseImage = await uploadToCloudinary(files.exerciseImage[0]);
        }
      } else {
        if (
          (files &&
            files.exerciseImage &&
            files.exerciseImage.length > 0) as boolean
        ) {
          exerciseImage = formatPathSingle(files.exerciseImage[0]);
        }
      }

      const exercise = await this.exerciseService.createExercise(
        lessonId,
        type,
        question,
        answer,
        focus,
        options,
        explanation,
        exerciseImage
      );

      res.status(StatusCodeEnum.Created_201).json({
        exercise: exercise,
        message: "Exercise created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [key: string]: Express.Multer.File[] };

      let exerciseImage;

      const { id } = req.params;
      const { question, answer, focus, options, explanation } = req.body;

      if (process.env.STORAGE_TYPE === "cloudinary") {
        if (files && files.exerciseImage && files.exerciseImage.length > 0) {
          exerciseImage = await uploadToCloudinary(files.exerciseImage[0]);
        }
      } else {
        if (
          (files &&
            files.exerciseImage &&
            files.exerciseImage.length > 0) as boolean
        ) {
          exerciseImage = formatPathSingle(files.exerciseImage[0]);
        }
      }

      const exercise = await this.exerciseService.updateExercise(
        id,
        question,
        answer,
        focus,
        options,
        explanation,
        exerciseImage
      );

      res.status(StatusCodeEnum.OK_200).json({
        exercise: exercise,
        message: "Exercise updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const exercise = await this.exerciseService.deleteExercise(id);
      res
        .status(StatusCodeEnum.OK_200)
        .json({ exercise: exercise, message: "Exercise deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  getExercises = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.id;
      const { page, size, order, sortBy, search } = req.query;

      const exercises = await this.exerciseService.getExercises(
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
          search: search as string,
        },
        lessonId as string
      );

      res.status(StatusCodeEnum.OK_200).json({
        ...exercises,
        message: "Exercises retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const exercise = await this.exerciseService.getExercise(id);

      res.status(StatusCodeEnum.OK_200).json({
        exercise: exercise,
        message: "Exercise retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ExerciseController;
