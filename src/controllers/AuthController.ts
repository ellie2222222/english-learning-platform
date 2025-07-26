import { Request, Response, NextFunction } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import ms from "ms";
import { IAuthService } from "../interfaces/services/IAuthService";
import { Inject, Service } from "typedi";
import AuthService from "../services/AuthService";
import CustomException from "../exceptions/CustomException";

@Service()
class AuthController {
  constructor(@Inject(() => AuthService) private authService: IAuthService) {}

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      const { accessToken, refreshToken } = await this.authService.login(
        email,
        password
      );

      // Set Refresh Token in cookies
      const COOKIES_EXPIRATION = Number(process.env.COOKIES_EXPIRATION!);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: COOKIES_EXPIRATION,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: COOKIES_EXPIRATION,
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      await this.authService.logout(refreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  loginGoogle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const googleUser = req.user;

      const { accessToken, refreshToken } = await this.authService.loginGoogle(
        googleUser
      );

      // Set Refresh Token in cookies
      const COOKIES_EXPIRATION = Number(process.env.COOKIES_EXPIRATION!);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: COOKIES_EXPIRATION,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: COOKIES_EXPIRATION,
      });

      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (error) {
      if (
        error instanceof CustomException &&
        error.code === StatusCodeEnum.Conflict_409
      ) {
        res.render("../templates/Whoops.ejs", {
          frontendUrl: process.env.FRONTEND_URL,
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Handles user signup.
   */
  signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      await this.authService.signup(name, email, password);

      res.status(StatusCodeEnum.Created_201).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserByToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization } = req.headers;
      const token =
        authorization?.split(" ")[1] || req.cookies?.accessToken || "";

      const user = await this.authService.getUserByToken(token);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles refreshing of an access token.
   */
  renewAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const accessToken = req.cookies?.accessToken;
      const refreshToken = req.cookies?.refreshToken;

      const newAccessToken = await this.authService.renewAccessToken(
        accessToken,
        refreshToken
      );

      const COOKIES_EXPIRATION = Number(process.env.COOKIES_EXPIRATION!);

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: COOKIES_EXPIRATION,
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles changing password
   */
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      const { userId } = req.userInfo;

      await this.authService.changePassword(userId, oldPassword, newPassword);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles verifying token
   */
  confirmEmailVerificationToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { verificationToken } = req.query;

      await this.authService.confirmEmailVerificationToken(
        verificationToken as string
      );

      res.status(StatusCodeEnum.OK_200).render("EmailVerificationSuccess");
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .render("EmailVerificationFailure", {
          errorMessage:
            (error as any).message || "Invalid or expired verification link.",
        });
    }
  };
  /**
   * Handles resetting password
   */
  sendResetPasswordPin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.sendResetPasswordPin(email);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles confirming reset password PIN
   */
  confirmResetPasswordPin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { pin, email } = req.body;

      await this.authService.confirmResetPasswordPin(email, pin);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles resetting password
   */
  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { newPassword, email } = req.body;

      await this.authService.resetPassword(email, newPassword);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
