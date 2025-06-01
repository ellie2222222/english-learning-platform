import { Inject, Service } from "typedi";
import { IUserAchievement } from "../interfaces/models/IUserAchievement";
import { IUserAchievementService } from "../interfaces/services/IUserAchievementService";
import UserAchievementRepository from "../repositories/UserAchievementRepository";
import { IUserAchievementRepository } from "../interfaces/repositories/IUserAchievementRepository";
import Database from "../db/database";
import mongoose from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/others/IQuery";
import getLogger from "../utils/logger";

@Service()
class UserAchievementService implements IUserAchievementService {
  constructor(
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
    }
  };

  getUserAchievement = async (id: string): Promise<IUserAchievement | null> => {
    try {
      return await this.userAchievementRepository.getUserAchievement(id);
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
    userId: string
  ): Promise<IUserAchievement[] | []> => {
    try {
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
