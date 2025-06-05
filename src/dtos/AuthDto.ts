import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import validator from "validator";
import { validateName } from "../utils/validator";
import CustomException from "../exceptions/CustomException";

class AuthDto {
  /**
   * Validates input for login requests.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Invalid email format",
      });
      return;
    }

    if (!password) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Password is required",
      });
      return;
    }

    next();
  }

  /**
   * Validates input for signup requests.
   */
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name, email, password } = req.body;

    if (!name) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Name is required",
      });
      return;
    }

    try {
      validateName(name);
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof CustomException ? error.message : "Invalid username",
      });
      return;
    }

    if (!email || !validator.isEmail(email)) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Invalid email format",
      });
      return;
    }

    if (
      !password ||
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }) ||
      password.length > 50
    ) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be between 8-50 characters long",
      });
      return;
    }

    next();
  }

  /**
   * Validates input for change password requests.
   */
  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Old password is required",
      });
      return;
    }

    if (!newPassword) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "New password is required",
      });
      return;
    }

    if (oldPassword === newPassword) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "New password cannot be the same as old password",
      });
      return;
    }

    if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }) ||
      newPassword.length > 50
    ) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          "New password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be between 8-50 characters long",
      });
      return;
    }

    next();
  }

  sendResetPasswordPin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email || !validator.isEmail(email)) {
        throw new Error("Invalid email");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
      return;
    }
  };

  confirmResetPasswordPin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { pin, email } = req.body;
      if (!pin || !email) {
        throw new Error("Missing required field");
      }

      if (pin.length !== 6) {
        throw new Error("Invalid pin");
      }

      if (!validator.isEmail(email)) {
        throw new Error("Invalid email");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
      return;
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { newPassword, email } = req.body;

      if (!newPassword || !email) {
        throw new Error("Missing required field");
      }

      if (!validator.isEmail(email)) {
        throw new Error("Invalid email");
      }

      if (
        !validator.isStrongPassword(newPassword, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        }) ||
        newPassword.length > 50
      ) {
        throw new Error(
          "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be between 8-50 characters long"
        );
      }
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
      return;
    }
  };
}

export default AuthDto;
