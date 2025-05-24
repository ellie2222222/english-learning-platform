import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IUser } from "../interfaces/models/IUser";
import sendMail from "../utils/mailer";
import Mail from "nodemailer/lib/mailer";
import IJwtPayload, {
  IVerificationTokenPayload,
} from "../interfaces/others/IJwtPayload";
import path from "path";
import ejs from "ejs";
import UserEnum from "../enums/UserEnum";
import { IAuthService } from "../interfaces/services/IAuthService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import Database from "../db/database";

dotenv.config();

const emailTemplatePath = path.resolve(
  __dirname,
  "../templates/EmailVerification.ejs"
);

class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private database: Database;

  constructor(
    userRepository: IUserRepository,
  ) {
    this.userRepository = userRepository;
    this.database = Database.getInstance();
  }

  /**
   * Generates an Access Token.
   *
   * @param attributes - The payload attributes to include in the token.
   * @returns The signed JWT as a string.
   */
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
    password: string,
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
        name: user.username,
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
    googleUser: any,
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
      let user: IUser | null = await this.userRepository.getGoogleUser(
        email,
        sub
      );

      // If the user doesn't exist, create a new user
      if (!user) {
        user = await this.userRepository.createUser({
          email,
          name,
          avatar: picture,
          googleId: sub,
        });
      }

      // Generate tokens
      const timestamp = new Date().toISOString();
      const payload = {
        userId: user._id,
        name: user.username,
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
   * @param name - The user's name.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the JWT if credentials are valid, or throws an error.
   */
  signup = async (
    name: string,
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

      this.sendVerificationEmail(email, password, name);

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
    name: string
  ): Promise<void> => {
    try {
      // Generate token
      const token = jwt.sign(
        { email, password, name },
        process.env.EMAIL_TOKEN_SECRET as string,
        { expiresIn: process.env.EMAIL_TOKEN_EXPIRATION }
      );

      const url =
        process.env.NODE_ENV?.toLowerCase() === "production"
          ? process.env.PRODUCTION_URL
          : process.env.FRONTEND_URL;

      const emailHtml = await ejs.renderFile(emailTemplatePath, {
        name: name,
        expiration: process.env.EMAIL_TOKEN_EXPIRATION,
        verificationLink: `${url}/email-verification?verificationToken=${token}`,
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
      const { name, email, password } = payload;

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
          name,
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
}

export default AuthService;
