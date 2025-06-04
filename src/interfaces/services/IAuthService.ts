import { IUser } from "../models/IUser";

export interface IAuthService {
  renewAccessToken: (
    accessToken: string,
    refreshToken: string
  ) => Promise<string>;

  login: (
    email: string,
    password: string
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  logout: (refreshToken: string) => Promise<void>;

  loginGoogle: (googleUser: any) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  signup: (name: string, email: string, password: string) => Promise<void>;

  getUserByToken: (accessToken: string) => Promise<IUser | null>;

  changePassword: (
    email: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<void>;

  confirmEmailVerificationToken: (token: string) => Promise<void>;

  sendResetPasswordPin: (email: string) => Promise<void>;

  confirmResetPasswordPin: (email: string, pin: string) => Promise<void>;

  resetPassword: (email: string, newPassword: string) => Promise<void>;
}
