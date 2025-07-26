import { Inject, Service } from "typedi";
import UserExerciseService from "../services/UserExerciseService";
import { IUserExerciseService } from "../interfaces/services/IUserExerciseService";
import { NextFunction, Request, Response } from "express";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import StatusCodeEnum from "../enums/StatusCodeEnum";

@Service()
class UserExerciseController {
  constructor(
    @Inject(() => UserExerciseService)
    private userExerciseService: IUserExerciseService
  ) {}

  getUserExercises = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, order, sortBy, search } = req.query;
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const userExercise = await this.userExerciseService.getUserExercises(
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          order: order as OrderType,
          sortBy: sortBy as SortByType,
          search: search as string,
        },
        id,
        requesterId
      );

      res.status(StatusCodeEnum.OK_200).json({
        ...userExercise,
        message: "User exercises retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserExercise = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const userExercise = await this.userExerciseService.getUserExercise(
        id,
        requesterId
      );
      res.status(StatusCodeEnum.OK_200).json({
        userExercise: userExercise,
        message: "User exercise retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  submitExercise = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id, answer } = req.body;
      const userId = req.userInfo.userId;
      const { userExercise, message } =
        await this.userExerciseService.submitExercise(id, userId, answer);

      res.status(StatusCodeEnum.Created_201).json({
        userExercise: userExercise,
        message: message,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserExerciseByExerciseId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const userExercise =
        await this.userExerciseService.getUserExerciseByExerciseId(
          id,
          requesterId
        );
      res.status(StatusCodeEnum.OK_200).json({
        userExercise: userExercise,
        message: "User exercise retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
export default UserExerciseController;
