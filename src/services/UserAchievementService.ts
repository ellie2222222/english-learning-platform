import { Inject, Service } from "typedi";
import { IUserAchievement } from "../interfaces/models/IUserAchievement";
import { IUserAchievementService } from "../interfaces/services/IUserAchievementService";
import UserAchievementRepository from "../repositories/UserAchievementRepository";
import { IUserAchievementRepository } from "../interfaces/repositories/IUserAchievementRepository";
import Database from "../db/database";
import mongoose, { ObjectId } from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/others/IQuery";
import getLogger from "../utils/logger";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import UserEnum from "../enums/UserEnum";
import AchievementRepository from "../repositories/AchievementRepository";
import { IAchievementRepository } from "../interfaces/repositories/IAchievementRepository";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class UserAchievementService implements IUserAchievementService {
  constructor(
    @Inject(() => UserRepository) private userRepository: IUserRepository,
    @Inject(() => AchievementRepository)
    private achievementRepository: IAchievementRepository,
    @Inject(() => UserAchievementRepository)
    private userAchievementRepository: IUserAchievementRepository,
    @Inject() private database: Database
  ) {}

  //this will be use in to create user achievement after user login/finish lesson/finish courses
  createUserAchievement = async (
    userId: string,
    achievementId: string
  ): Promise<IUserAchievement | null> => {
    const session = await this.database.startTransaction();
    const logger = getLogger("ACHIEVEMENT");
    try {
      const checkAchievement = await this.achievementRepository.getAchievement(
        achievementId
      );

      if (!checkAchievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }

      const existedAchievement =
        await this.userAchievementRepository.findExistingAchievement(
          achievementId,
          userId
        );

      if (existedAchievement) {
        logger.info(
          `user ${userId} has accomplished achievement ${achievementId} already`
        );
        return null;
      }
      const userAchievement =
        await this.userAchievementRepository.createUserAchievement({
          userId: new mongoose.Types.ObjectId(userId),
          achievementId: new mongoose.Types.ObjectId(achievementId),
        });

      await this.database.commitTransaction(session);

      return userAchievement;
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

  getUserAchievement = async (
    id: string,
    requesterId: string
  ): Promise<IUserAchievement | null> => {
    try {
      const requester = await this.userRepository.getUserById(
        requesterId,
        false
      );
      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const achievement =
        await this.userAchievementRepository.getUserAchievement(id);
      if (!achievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }

      const isOwner =
        (requester._id as ObjectId).toString() ===
        (achievement.userId as ObjectId).toString();
      const isAdmin = requester.role === UserEnum.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }
      return achievement;
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

  getUserAchievements = async (
    query: IQuery,
    userId: string,
    requesterId: string
  ): Promise<IPagination> => {
    try {
      const requester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const isOwner = (requester._id as ObjectId).toString() === userId;
      const isAdmin = requester.role === UserEnum.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }

      const userAchievements =
        await this.userAchievementRepository.getUserAchievements(query, userId);

      return userAchievements;
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

export default UserAchievementService;
