import { Types, ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import CustomException from "../exceptions/CustomException";
import bcrypt from "bcrypt";
import { IUserService } from "../interfaces/services/IUserService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { cleanUpFile } from "../utils/fileUtils";
import Database from "../db/database";
import { IUser } from "../interfaces/models/IUser";
import { IPagination } from "../interfaces/others/IPagination";
import { IQuery } from "../interfaces/others/IQuery";
import { Inject, Service } from "typedi";
import UserRepository from "../repositories/UserRepository";
import MembershipRepository from "../repositories/MembershipRepository";
import { IMembershipRepository } from "../interfaces/repositories/IMembershipRepository";
import getLogger from "../utils/logger";

@Service()
class UserService implements IUserService {
  constructor(
    @Inject(() => UserRepository) private userRepository: IUserRepository,
    @Inject(() => MembershipRepository)
    private membershipRepository: IMembershipRepository,
    @Inject() private database: Database
  ) {}

  private async validateRequester(requesterId: string): Promise<IUser> {
    const requester = await this.userRepository.getUserById(requesterId, false);
    if (!requester) {
      throw new CustomException(
        StatusCodeEnum.NotFound_404,
        "Requester not found"
      );
    }
    return requester;
  }

  private handleError(error: unknown, session?: any): never {
    if (session) {
      this.database.abortTransaction(session);
    }
    throw error instanceof CustomException
      ? error
      : new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "Internal Server Error"
        );
  }

  private authorizeUpdate(
    requester: IUser,
    id: string | ObjectId,
    role?: number
  ): void {
    const isAdmin = requester.role === UserEnum.ADMIN;
    const isSelf = (id as string) === (requester.id as string);

    if (role !== undefined && !isAdmin) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "You do not have the authority to perform this action"
      );
    }

    if (!isAdmin && !isSelf) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "You do not have the authority to perform this action"
      );
    }
  }

  async createUser(
    username: string,
    password: string,
    email: string,
    role: number,
    requesterId: string
  ): Promise<IUser> {
    let session;
    try {
      session = await this.database.startTransaction();

      const requester = await this.validateRequester(requesterId);
      if (requester.role !== UserEnum.ADMIN) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "Only admins can create new users"
        );
      }

      if (!Object.values(UserEnum).includes(role)) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid role"
        );
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      const data = {
        username,
        password: hashedPassword,
        email,
        role,
      };

      const user = await this.userRepository.createUser(data, session);
      await this.database.commitTransaction(session);
      return user;
    } catch (error) {
      this.handleError(error, session);
    }
  }

  async getUserById(id: string, requesterId: string): Promise<IUser> {
    try {
      await this.validateRequester(requesterId);

      const user = await this.userRepository.getUserById(id, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      return user;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUsers(Query: IQuery, requesterId: string): Promise<IPagination> {
    try {
      await this.validateRequester(requesterId);
      const data = await this.userRepository.getUsers(Query);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUser(
    id: string,
    requesterId: string,
    username?: string,
    role?: number,
    avatar?: string
  ): Promise<IUser | null> {
    let session;
    try {
      session = await this.database.startTransaction();

      const requester = await this.validateRequester(requesterId);
      const user = await this.userRepository.getUserById(id, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      this.authorizeUpdate(requester, id, role);

      const updateData: Partial<IUser> = {};
      if (username) updateData.username = username;
      if (role !== undefined) updateData.role = role;
      if (avatar) updateData.avatar = avatar;

      const updatedUser = await this.userRepository.updateUserById(
        id,
        updateData,
        session
      );
      if (avatar && user.avatar) {
        await cleanUpFile(user.avatar, "update");
      }

      await this.database.commitTransaction(session);
      return updatedUser;
    } catch (error) {
      this.handleError(error, session);
    }
  }

  async deleteUser(id: string, requesterId: string): Promise<boolean> {
    let session;
    try {
      session = await this.database.startTransaction();

      const requester = await this.validateRequester(requesterId);
      if (requester.role !== UserEnum.ADMIN) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "Only admins can delete users"
        );
      }

      const user = await this.userRepository.getUserById(id, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      await this.userRepository.deleteUserById(id, session);
      // if (user.avatar) {
      //   await cleanUpFile(user.avatar, "delete");
      // }

      await this.database.commitTransaction(session);
      return true;
    } catch (error) {
      this.handleError(error, session);
    }
  }

  async getExpiredUsers(): Promise<IUser[] | []> {
    try {
      const users = await this.userRepository.getExpiredUsers();
      return users;
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleExpiredUsers(users: IUser[] | []): Promise<number> {
    const session = await this.database.startTransaction();
    try {
      const logger = await getLogger("MEMBERSHIP_EXPIRATION");
      let value = 0;
      await Promise.all(
        users.map(async (user) => {
          const checkUser = await this.userRepository.getUserById(
            (user._id as ObjectId).toString()
          );

          if (!checkUser) {
            logger.warn(
              `User with userId: ${(user._id as ObjectId).toString()} not found`
            );
            return;
          }

          await this.userRepository.updateUserById(
            (user._id as ObjectId).toString(),
            { activeUntil: null },
            session
          );
          value += 1;
        })
      );

      await this.database.commitTransaction(session);
      return value;
    } catch (error) {
      this.handleError(error, session);
    }
  }

  async getTopLeaderBoardUser(top: number, field: string): Promise<IUser[]> {
    try {
      const users = await this.userRepository.getTopLeaderBoardUser(top, field);
      return users;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default UserService;
