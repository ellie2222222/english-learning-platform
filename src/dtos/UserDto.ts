import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import {
  validateEmail,
  validateMongooseObjectId,
  validateName,
  validatePassword,
} from "../utils/validator";
import CustomException from "../exceptions/CustomException";

class UserDto {
  async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { username, email, password } = req.body;

    try {
      validateName(username);
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof CustomException ? error.message : "Invalid username",
      });
      return;
    }

    try {
      validateEmail(email);
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof CustomException ? error.message : "Invalid email",
      });
      return;
    }

    try {
      validatePassword(password);
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof CustomException ? error.message : "Invalid password",
      });
      return;
    }

    next();
  }

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof CustomException ? error.message : "Invalid user ID",
      });
      return;
    }

    next();
  }

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { page, size, order, sortBy } = req.query;

    const parsedPage = parseInt(page as string, 10);
    if (page && (!Number.isInteger(parsedPage) || parsedPage < 1)) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Page must be an integer greater than or equal to 1",
      });
      return;
    }

    const parsedSize = parseInt(size as string, 10);
    if (size && (!Number.isInteger(parsedSize) || parsedSize < 1)) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Size must be an integer greater than or equal to 1",
      });
      return;
    }

    const validSortBy = ["date", "username"];
    if (sortBy && !validSortBy.includes(sortBy as string)) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: `Sort by must be one of: ${validSortBy.join(", ")}`,
      });
      return;
    }

    const validOrder = ["asc", "desc"];
    if (order && !validOrder.includes(order as string)) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: `Order must be one of: ${validOrder.join(", ")}`,
      });
      return;
    }

    req.query.sortBy = sortBy || "date";
    req.query.order = order || "descending";
    req.query.page = page ? parsedPage.toString() : "1";
    req.query.size = size ? parsedSize.toString() : "10";

    next();
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const { username } = req.body;

    try {
      validateMongooseObjectId(id);
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof CustomException ? error.message : "Invalid user ID",
      });
      return;
    }

    if (username) {
      try {
        validateName(username);
      } catch (error) {
        res.status(StatusCodeEnum.BadRequest_400).json({
          message:
            error instanceof CustomException
              ? error.message
              : "Invalid username",
        });
        return;
      }
    }

    next();
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof CustomException ? error.message : "Invalid user ID",
      });
      return;
    }

    next();
  }
}

export default UserDto;
