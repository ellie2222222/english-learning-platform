import { Inject, Service } from "typedi";
import { IAchievement } from "../interfaces/models/IAchievement";
import { IAchievementService } from "../interfaces/services/IAchievementService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { IAchievementRepository } from "../interfaces/repositories/IAchievementRepository";
import AchievementRepository from "../repositories/AchievementRepository";
import { ObjectId } from "mongoose";
import UserAchievementRepository from "../repositories/UserAchievementRepository";
import { IUserAchievementRepository } from "../interfaces/repositories/IUserAchievementRepository";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class AchievementService implements IAchievementService {
  constructor(
    @Inject(() => AchievementRepository)
    private achievementRepository: IAchievementRepository,
    @Inject() private database: Database,
    @Inject(() => UserAchievementRepository)
    private userAchievementRepository: IUserAchievementRepository
  ) {}

  createAchievement = async (
    name: string,
    description: string,
    type: string,
    goal: number
  ): Promise<IAchievement> => {
    const session = await this.database.startTransaction();
    try {
      const existingAchievement =
        await this.achievementRepository.getExistingAchievement(
          name,
          type,
          goal
        );

      if (existingAchievement) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Duplicate achievement: an entry with the same configuration already exists."
        );
      }

      const achievement = await this.achievementRepository.createAchievement(
        {
          name,
          description,
          type,
          goal,
        },
        session
      );

      await session.commitTransaction(session);
      return achievement;
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

  updateAchievement = async (
    id: string,
    name?: string,
    description?: string,
    type?: string,
    goal?: number
  ): Promise<IAchievement | null> => {
    const session = await this.database.startTransaction();
    try {
      const currentAchievement =
        await this.achievementRepository.getAchievement(id);

      if (!currentAchievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }

      // Use provided or current values for duplicate check
      const checkName = name ?? currentAchievement.name;
      const checkType = type ?? currentAchievement.type;
      const checkGoal = goal ?? currentAchievement.goal;

      const existingAchievement =
        await this.achievementRepository.getExistingAchievement(
          checkName,
          checkType,
          checkGoal,
          String(currentAchievement._id as ObjectId)
        );

      if (existingAchievement) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "Achievement with these settings has already exists"
        );
      }
      // Build update data for provided fields
      const updateData: Partial<IAchievement> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (goal !== undefined) updateData.goal = goal;

      // Perform update
      const achievement = await this.achievementRepository.updateAchievement(
        id,
        updateData,
        session
      );
      if (!achievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }

      await this.database.commitTransaction(session);
      return achievement;
    } catch (error) {
      await this.database.abortTransaction(session);
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

  deleteAchievement = async (id: string): Promise<IAchievement | null> => {
    const session = await this.database.startTransaction();
    try {
      const checkAchievement = await this.achievementRepository.getAchievement(
        id
      );

      if (!checkAchievement) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Achievement not found"
        );
      }
      // //option 1: delete all related user achievement
      // const result =
      //   await this.userAchievementRepository.deleteBatchUserAchievements(
      //     id,
      //     session
      //   );

      // if (result < 0) {
      //   throw new CustomException(
      //     StatusCodeEnum.InternalServerError_500,
      //     "Failed to delete related user achievements"
      //   );
      // }

      //option 2: notify user about it's status and rarerity
      const achievevers =
        await this.userAchievementRepository.countUserAchievement(id);
      const updatedAchievement =
        await this.achievementRepository.updateAchievement(id, {
          description: `${checkAchievement.description} This achievement has been retired, making it one of a kind! Only ${achievevers} user(s), including you, have earned this exclusive honor.`,
        });

      const achievement = await this.achievementRepository.deleteAchievement(
        id,
        session
      );

      await session.commitTransaction(session);
      return achievement;
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

  getAchievement = async (id: string): Promise<IAchievement | null> => {
    try {
      const achievement = await this.achievementRepository.getAchievement(id);

      return achievement as IAchievement;
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

  getAchievements = async (
    query: IQuery,
    type?: string
  ): Promise<IPagination> => {
    try {
      const achievements = await this.achievementRepository.getAchievements(
        query,
        type
      );

      return achievements;
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

export default AchievementService;
