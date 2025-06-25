import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import mongoose from "mongoose";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class UserExerciseDto {
  getUserExercises = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, size, order, sortBy, search } = req.query;
      const { id } = req.params;

      if (!id) {
        throw new Error("User exercise ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid user exercise ID");
      }

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

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  getUserExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("User exercise ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid user exercise ID");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  submitExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, answer } = req.body;

      if (!id || !answer) {
        throw new Error("User exercise ID and answer are required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid user exercise ID");
      }

      if (typeof answer !== "string") {
        throw new Error("Answer must be a string");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
      return;
    }
  };

  getUserExerciseByExerciseId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
}

export default UserExerciseDto;
