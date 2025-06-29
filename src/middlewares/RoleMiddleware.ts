import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Request, Response, NextFunction } from "express";
import UserRepository from "../repositories/UserRepository";
import { IUser } from "../interfaces/models/IUser";
import UserEnum from "../enums/UserEnum";
import Container from "typedi";

/**
 *
 * @param roles - The required roles
 * @returns An async function
 */
const RoleMiddleware = (roles: Array<number>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userInfo?.userId;

      if (!userId && roles.includes(UserEnum.GUEST)) {
        return next();
      }
      const userRepository = Container.get(UserRepository);

      const user: IUser | null = await userRepository.getUserById(
        userId,
        false
      );

      if (!user) {
        res
          .status(StatusCodeEnum.Unauthorized_401)
          .json({ message: "Invalid user from access token" });
        return;
      }

      // if (user.role === UserEnum.ADMIN) {
      //   return next();
      // }

      if (!roles.includes(user?.role)) {
        res
          .status(StatusCodeEnum.Forbidden_403)
          .json({ message: "Unauthorized access" });
        return;
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.InternalServerError_500)
        .json({ message: "Internal Server Error" });
      return;
    }
  };
};

export default RoleMiddleware;
