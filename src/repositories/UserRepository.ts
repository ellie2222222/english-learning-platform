import mongoose, { Types } from "mongoose";
import UserModel from "../models/UserModel";
import { IUser } from "../interfaces/models/IUser";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IPagination } from "../interfaces/others/IPagination";
import { IQuery } from "../interfaces/others/IQuery";
import { Service } from "typedi";
import { INewUsers } from "../interfaces/others/IStatisticData";

@Service()
class UserRepository implements IUserRepository {
  /**
   * Creates a new user document in the database.
   * @param data - Object containing user data.
   * @param session - Optional MongoDB client session for transactional operations.
   * @returns The created user document.
   * @throws Error when the creation fails.
   */
  async createUser(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUser> {
    try {
      const userData = data as { email: string };
      const user = await UserModel.findOneAndUpdate(
        { email: userData.email },
        { $setOnInsert: data },
        { upsert: true, new: true, session }
      );
      return user!;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to create user: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches a user document by its ID.
   * @param userId - The ID of the user to retrieve.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getUserById(
    userId: string,
    ignoreDeleted: boolean
  ): Promise<IUser | null> {
    try {
      const searchQuery: { _id: mongoose.Types.ObjectId; isDeleted?: boolean } =
        {
          _id: new mongoose.Types.ObjectId(userId),
        };
      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      return await UserModel.findOne(searchQuery);
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to find user by ID: ${(error as Error).message}`
      );
    }
  }

  /**
   * Fetches a user document by email.
   * @param email - The email address to search for.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email: { $eq: email } });
      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to finding user by email: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches a user document by email.
   * @param email - The email address to search for.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getGoogleUser(email: string, googleId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({
        $or: [{ email: { $eq: email } }, { googleId: { $eq: googleId } }],
      });
      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to finding user by email: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Marks a user document as deleted by setting `isDeleted` to true.
   * @param userId - The ID of the user to delete.
   * @returns True if the operation is successful.
   * @throws Error when the update fails.
   */
  async deleteUserById(
    userId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      await UserModel.findByIdAndUpdate(
        userId,
        { isDeleted: true },
        { session, new: true }
      );
      return true;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to deleting a user by id: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Updates a user document by its ID with partial data.
   * @param userId - The ID of the user to update.
   * @param data - Partial user data to update.
   * @returns The updated user document or null if not found.
   * @throws Error when the update fails.
   */
  async updateUserById(
    userId: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUser | null> {
    try {
      data = {
        ...data,
        updatedAt: new Date(),
      };

      const user = await UserModel.findByIdAndUpdate(userId, data, {
        session,
        new: true,
      });

      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to updating user by id: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  // TODO
  async getUsers(query: IQuery): Promise<IPagination> {
    try {
      const users = await UserModel.find({}).lean();
      return {
        page: 1,
        totalPages: 1,
        total: 10,
        data: users,
      };
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
  async getAllUsersTimeInterval(
    startDate: Date,
    endDate: Date,
    groupBy: string
  ): Promise<INewUsers[]> {
    try {
      const users = await UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            isDeleted: { $eq: false },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: groupBy, date: "$createdAt" } },
            newUsers: { $sum: 1 },
          },
        },
        {
          $project: {
            Date: "$_id",
            newUsers: 1,
            _id: 0,
          },
        },
        { $sort: { Date: 1 } },
      ]);

      return users;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getExpiredUsers() {
    try {
      const users = await UserModel.find({
        activeUntil: { $lte: new Date() },
        isDeleted: false,
      });

      return users;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getAllUserForLoginAchievement(goal: number): Promise<IUser[]> {
    try {
      const users = await UserModel.find({
        onlineStreak: { $gte: goal },
        isDeleted: false,
      }).lean();
      return users;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async getTopLeaderBoardUser(top: number, field: string): Promise<IUser[]> {
    try {
      const users = await UserModel.aggregate([
        { $match: { isDeleted: false } },
        { $sort: { [field]: -1 } },
        { $limit: top },
      ]);

      return users;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }
}

export default UserRepository;
