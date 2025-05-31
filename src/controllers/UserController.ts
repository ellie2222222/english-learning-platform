import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IUser } from "../interfaces/models/IUser";
import { IUserService } from "../interfaces/services/IUserService";
import { Request, Response, NextFunction } from "express";
import { cleanUpFile } from "../utils/fileUtils";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import UserService from "../services/UserService";
import { Inject, Service } from "typedi";

@Service()
class UserController {
  constructor(@Inject(() => UserService) private userService: IUserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.userInfo.userId;
      const { name, email, password, role } = req.body;

      const user = await this.userService.createUser(
        name,
        password,
        email,
        role,
        requesterId
      );

      res.status(StatusCodeEnum.Created_201).json({
        user: user,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const user = await this.userService.getUserById(id, requesterId);

      res.status(StatusCodeEnum.OK_200).json({
        user: user,
        message: "Get user successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy, role } = req.query;
      const requesterId = req.userInfo.userId;

      const data = await this.userService.getUsers(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          role: role as string,
          order: (order as OrderType) || "asc",
          sortBy: (sortBy as SortByType) || "date",
        },
        requesterId
      );

      res.status(StatusCodeEnum.OK_200).json(data);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, role, phoneNumber } = req.body;
      const requesterId = req.userInfo.userId;
      let user: IUser | null;
      if (req.file) {
        user = await this.userService.updateUser(
          id,
          requesterId,
          name,
          role,
          `${process.env.SERVER_URL}/${req.file.path}`
        );
      } else {
        user = await this.userService.updateUser(id, requesterId, name, role);
      }

      res
        .status(StatusCodeEnum.OK_200)
        .json({ user: user, message: "User updated successfully" });
    } catch (error) {
      if (req.file) {
        cleanUpFile(req.file.path, "create");
      }
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const user = await this.userService.deleteUser(id, requesterId);

      res
        .status(StatusCodeEnum.OK_200)
        .json({ userIsDeleted: user, message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
