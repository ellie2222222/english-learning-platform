import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IUser } from "../interfaces/models/IUser";
import { sendMail } from "../utils/mailer";
import Mail from "nodemailer/lib/mailer";
import IJwtPayload, {
  IVerificationTokenPayload,
} from "../interfaces/others/IJwtPayload";
import path from "path";
import ejs from "ejs";
import { IAuthService } from "../interfaces/services/IAuthService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import Database from "../db/database";
import Container, { Inject, Service } from "typedi";
import UserRepository from "../repositories/UserRepository";
import AchievementRepository from "../repositories/AchievementRepository";
import { IAchievementRepository } from "../interfaces/repositories/IAchievementRepository";
import UserAchievementRepository from "../repositories/UserAchievementRepository";
import { IUserAchievementRepository } from "../interfaces/repositories/IUserAchievementRepository";
import { AchievementTypeEnum } from "../enums/AchievementTypeEnum";
import { ObjectId } from "mongoose";
import getLogger from "../utils/logger";
import { notifyAchievement } from "../utils/mailer";

dotenv.config();

const emailTemplatePath = path.resolve(
  __dirname,
  "../templates/EmailVerification.ejs"
);

const resetEmailTemplatePath = path.resolve(
  __dirname,
  "../templates/EmailForgotPassword.ejs"
);

const achievementEmailTemplatePath = path.resolve(
  __dirname,
  "../templates/UserAchievementNotification.ejs"
);

@Service()
class AuthService implements IAuthService {
  constructor(
    @Inject(() => UserRepository) private userRepository: IUserRepository,
    @Inject() private database: Database,
    @Inject(() => AchievementRepository)
    private achievementRepository: IAchievementRepository,
    @Inject(() => UserAchievementRepository)
    private userAchievementRepository: IUserAchievementRepository
  ) {}

  /**
   * Generates an Access Token.
   *
   * @param attributes - The payload attributes to include in the token.
   * @returns The signed JWT as a string.
   */

  private parseDuration(duration: string) {
    try {
      if (!duration || typeof duration !== "string") {
        return 0;
      }

      const match = duration.match(/^(\d+)([smhd])$/);
      if (!match) {
        throw new Error(
          `Invalid duration format: ${duration}. Expected format like "30s", "15m", "2h", or "1d".`
        );
      }

      const value = parseInt(match[1], 10);
      const unit = match[2] as "s" | "m" | "h" | "d";

      const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };

      if (!multipliers[unit]) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Invalid unit: ${unit}. Supported units are s, m, h, d.`
        );
      }

      return value * multipliers[unit];
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "InternalServerError"
      );
    }
  }

  private generateAccessToken = (attributes: object): string => {
    try {
      const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET!;
      const accessTokenExpiration: string =
        process.env.ACCESS_TOKEN_EXPIRATION!;

      return jwt.sign(attributes, accessTokenSecret, {
        expiresIn: accessTokenExpiration,
      });
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Generates a Refresh Token.
   *
   * @param attributes - The payload attributes to include in the token.
   * @returns The signed JWT as a string.
   */
  private generateRefreshToken = (attributes: object): string => {
    try {
      const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET!;
      const refreshTokenExpiration: string =
        process.env.REFRESH_TOKEN_EXPIRATION!;

      return jwt.sign(attributes, refreshTokenSecret, {
        expiresIn: refreshTokenExpiration,
      });
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Renew an Access Token.
   *
   * @param refreshToken - The refresh token string.
   * @returns A promise that resolves to the new JWT Access Token.
   */
  renewAccessToken = async (
    accessToken: string,
    refreshToken: string
  ): Promise<string> => {
    try {
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

      let isAccessTokenExpired = false;

      // Verify the access token
      try {
        jwt.verify(accessToken, accessTokenSecret);
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Access token is still valid. No need to refresh."
        );
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          isAccessTokenExpired = true;
        } else {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Invalid access token"
          );
        }
      }

      if (isAccessTokenExpired) {
        let payload: IJwtPayload | null = null;
        try {
          payload = jwt.verify(
            refreshToken,
            refreshTokenSecret
          ) as IJwtPayload | null;
          if (!payload) {
            throw new CustomException(
              StatusCodeEnum.Unauthorized_401,
              "Invalid refresh token"
            );
          }
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            throw new CustomException(
              StatusCodeEnum.Unauthorized_401,
              "Refresh token expired. Please log in again."
            );
          }
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Invalid refresh token"
          );
        }

        const user = await this.userRepository.getUserById(
          payload!.userId,
          false
        );
        if (!user) {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "User not found"
          );
        }

        // Generate a new access token
        const newPayload = {
          userId: user._id,
          name: user.username,
          email: user.email,
          role: user.role,
          timestamp: new Date().toISOString(),
        };

        return this.generateAccessToken(newPayload);
      }

      throw new CustomException(
        StatusCodeEnum.BadRequest_400,
        "Unexpected error occurred while refreshing token"
      );
    } catch (error) {
      if (error instanceof CustomException || error instanceof Error) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Logs in a user and generates an access token.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the JWT if credentials are valid, or throws an error.
   */
  login = async (
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    try {
      const user: IUser | null = await this.userRepository.getUserByEmail(
        email
      );

      // Validate credentials
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Incorrect email or password"
        );
      }
      if (user && user.googleId) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Incorrect email or password"
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!user || !isPasswordValid) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Incorrect email or password"
        );
      }

      // Generate access token
      const timestamp = new Date().toISOString();
      const payload = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        timestamp,
      };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      await this.loginAchievementTrigger((user._id as ObjectId).toString());
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  logout = async (refreshToken: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const payload = jwt.decode(refreshToken) as IJwtPayload | null;

      if (!payload || !payload.userId) {
        throw new CustomException(
          StatusCodeEnum.Unauthorized_401,
          "Invalid refresh token payload"
        );
      }

      const { userId } = payload;

      // Check if user exists
      const user = await this.userRepository.getUserById(userId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);

      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  loginGoogle = async (
    googleUser: any
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    try {
      const { email, name, picture, sub } = googleUser._json as {
        email: string;
        name: string;
        picture: string;
        sub: string;
      };

      // Check if user already exists
      let user: IUser | null = await this.userRepository.getUserByEmail(email);

      // If the user doesn't exist, create a new user
      if (!user) {
        user = await this.userRepository.createUser({
          email,
          username: name,
          avatar: picture,
          googleId: sub,
        });
      }

      if (user && user.googleId === null) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "This email has been taken"
        );
      }

      // Generate tokens
      const timestamp = new Date().toISOString();
      const payload = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        timestamp,
      };
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Signs up a user and generates an access token.
   *
   * @param username - The user's name.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the JWT if credentials are valid, or throws an error.
   */
  signup = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const existingUser = await this.userRepository.getUserByEmail(email);

      if (existingUser) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "Email already exists"
        );
      }

      this.sendVerificationEmail(email, password, username);

      return;
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Get user by JWT token.
   *
   * @param userId - The user ID.
   * @returns A void promise.
   */
  getUserByToken = async (accessToken: string): Promise<IUser | null> => {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as IJwtPayload;

      const { userId } = decoded;
      const user = await this.userRepository.getUserById(userId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        if ((error as Error).name === "TokenExpiredError") {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Token expired"
          );
        } else if ((error as Error).name === "JsonWebTokenError") {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Invalid access token"
          );
        }
      }
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Change a password.
   *
   * @param userId - The user ID.
   * @param oldPassword - The user's old password.
   * @param newPassword - The user's new password.
   * @returns A void promise.
   */
  changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(userId, false);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Incorrect password"
        );
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updateData: Partial<IUser> = {
        password: hashedPassword,
      };

      await this.userRepository.updateUserById(userId, updateData, session);

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Sends a verification email to the user.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @param name - The user's name.
   * @returns A void promise.
   */
  private sendVerificationEmail = async (
    email: string,
    password: string,
    username: string
  ): Promise<void> => {
    try {
      // Generate token
      const token = jwt.sign(
        { email, password, username },
        process.env.EMAIL_TOKEN_SECRET as string,
        { expiresIn: process.env.EMAIL_TOKEN_EXPIRATION }
      );

      const url =
        process.env.NODE_ENV?.toLowerCase() === "production"
          ? process.env.PRODUCTION_URL
          : process.env.SERVER_URL;

      const emailHtml = await ejs.renderFile(emailTemplatePath, {
        username: username,
        expiration: process.env.EMAIL_TOKEN_EXPIRATION,
        verificationLink: `${url}/api/auth/email-verification?verificationToken=${token}`,
      });

      const mailOptions: Mail.Options = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Email Verification`,
        html: emailHtml,
      };

      await sendMail(mailOptions);

      return;
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Verify the user's email using the token.
   * @param token - The JWT token from the verification email.
   * @returns A void promise.
   */
  confirmEmailVerificationToken = async (token: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const payload = jwt.verify(
        token,
        process.env.EMAIL_TOKEN_SECRET!
      ) as IVerificationTokenPayload;
      const { username, email, password } = payload;

      // Check if user already exists
      const existingUser = await this.userRepository.getUserByEmail(email);
      if (existingUser) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "Email is already verified"
        );
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.userRepository.createUser(
        {
          username,
          email,
          password: hashedPassword,
        },
        session
      );

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);

      if (error instanceof Error) {
        if ((error as Error).name === "TokenExpiredError") {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Email verification token expired"
          );
        }
        if ((error as Error).name === "JsonWebTokenError") {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Invalid email verification token"
          );
        }
      }
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  sendResetPasswordPin = async (email: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User with specified email not found"
        );
      }

      if (user.googleId !== null) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "Google users do not use password"
        );
      }

      if (
        !process.env.RESET_TOKEN_SECRET ||
        !process.env.RESET_TOKEN_EXPIRATION
      ) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "Missing configuration for reset token"
        );
      }

      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPin = await bcrypt.hash(pin, salt);

      const emailTemplate = await ejs.renderFile(resetEmailTemplatePath, {
        name: user.username,
        pin: pin,
      });

      const mailOptions: Mail.Options = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Reset Password Request`,
        html: emailTemplate,
      };

      const updatedUser = await this.userRepository.updateUserById(
        user._id as string,
        {
          resetPasswordPin: {
            ...user.resetPasswordPin,
            value: hashedPin,
            expiresAt: new Date(
              Date.now() +
                this.parseDuration(process.env.RESET_TOKEN_EXPIRATION)
            ),
          },
        },
        session
      );

      await this.database.commitTransaction(session);
      await sendMail(mailOptions);
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

  confirmResetPasswordPin = async (
    email: string,
    pin: string
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      // Validate user ID
      const user = await this.userRepository.getUserByEmail(email);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (!user.resetPasswordPin || !user.resetPasswordPin.value) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid reset password PIN"
        );
      }

      const isPinValid = await bcrypt.compare(pin, user.resetPasswordPin.value);
      if (!isPinValid) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid reset password PIN"
        );
      }

      if (
        !user.resetPasswordPin.expiresAt ||
        user.resetPasswordPin.expiresAt < new Date()
      ) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Reset password PIN expired"
        );
      }

      // Change verify flag to true
      const updatePinData: Partial<IUser> = {
        resetPasswordPin: {
          ...user.resetPasswordPin,
          isVerified: true,
        },
      };

      await this.userRepository.updateUserById(
        user?._id as string,
        updatePinData,
        session
      );

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  resetPassword = async (email: string, newPassword: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      // Validate user ID
      const user = await this.userRepository.getUserByEmail(email);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (user.resetPasswordPin.isVerified !== true) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Reset password PIN is not verified"
        );
      }

      const isTheSame = await bcrypt.compare(newPassword, user.password);
      if (isTheSame) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "New password can't be the same as old password"
        );
      }

      // Hash new password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Clear password reset PIN and update password
      const updatePinData: Partial<IUser> = {
        password: hashedPassword,
        resetPasswordPin: {
          isVerified: false,
          value: null,
          expiresAt: null,
        },
      };
      await this.userRepository.updateUserById(
        user._id as string,
        updatePinData,
        session
      );

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  private loginAchievementTrigger = async (userId: string): Promise<void> => {
    const session = await this.database.startTransaction();
    const logger = getLogger("LOGIN_STREAK");
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const now = new Date(); // Current time in UTC
      const updateData: Partial<IUser> = { lastOnline: now };

      // First login
      if (!user.lastOnline) {
        updateData.onlineStreak = 1;
      } else {
        const last = new Date(user.lastOnline);

        // Normalize to midnight UTC
        last.setUTCHours(0, 0, 0, 0);

        const today = new Date(now);

        // Normalize to midnight UTC
        today.setUTCHours(0, 0, 0, 0);

        const oneDayMs = 24 * 60 * 60 * 1000;

        const diffMs = today.getTime() - last.getTime();

        // Consecutive day
        if (diffMs === oneDayMs) {
          updateData.onlineStreak = user.onlineStreak + 1;

          // Gap > 1 day, reset streak
        } else if (diffMs > oneDayMs) {
          updateData.onlineStreak = 1;
        }
      }

      const updatedUser = await this.userRepository.updateUserById(
        userId,
        updateData,
        session
      );
      if (!updatedUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Failed to update user"
        );
      }

      const closestAchievement =
        await this.achievementRepository.getClosestAchievement(
          AchievementTypeEnum.LoginStreak,
          updatedUser.onlineStreak
        );

      if (!closestAchievement) {
        logger.info(
          `No login streak achievement found for streak: ${updatedUser.onlineStreak}`
        );
        await this.database.commitTransaction(session);
        return;
      }

      // Check if achievement goal matches current streak
      if (closestAchievement.goal > updatedUser.onlineStreak) {
        logger.info(
          `Closest achievement goal (${closestAchievement.goal}) not yet reached for streak: ${updatedUser.onlineStreak}`
        );
        await this.database.commitTransaction(session);
        return;
      }

      // Check if user already has this achievement
      const achievedAchievement =
        await this.userAchievementRepository.findExistingAchievement(
          (closestAchievement._id as ObjectId).toString(),
          userId
        );
      if (achievedAchievement) {
        logger.info(
          `User ${userId} already has achievement ${closestAchievement._id}`
        );
        await this.database.commitTransaction(session);
        return;
      }

      // Create new user achievement
      const achievement =
        await this.userAchievementRepository.createUserAchievement(
          {
            userId,
            achievementId: closestAchievement._id,
          },
          session
        );

      if (!achievement) {
        logger.error(
          `Failed to create user achievement for user: ${userId}, achievement: ${closestAchievement._id}`
        );
        await this.database.commitTransaction(session);
        return;
      }

      logger.info(
        `Awarded achievement ${closestAchievement._id} to user ${userId} for streak: ${updatedUser.onlineStreak}`
      );
      await this.database.commitTransaction(session);

      //notify user
      notifyAchievement(closestAchievement, user.email);
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
}

export default AuthService;
