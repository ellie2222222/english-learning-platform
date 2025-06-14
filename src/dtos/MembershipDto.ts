import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import mongoose from "mongoose";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class MembershipDto {
  createMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, description, price, duration } = req.body;
      if (!name || !description || !price || !duration) {
        throw new Error("Missing required field");
      }

      if (parseFloat(price) <= 0) {
        throw new Error("Price must be greater than 0");
      }

      if (parseInt(duration) <= 0) {
        throw new Error("Duration (in days) must be greater than 0");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
    }
  };

  updateMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const { name, description, price, duration } = req.body;

      if (!id) {
        throw new Error("Missing membership id");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid membership id");
      }

      if (price && parseFloat(price) <= 0) {
        throw new Error("Price must be greater than 0");
      }

      if (duration && parseInt(duration) <= 0) {
        throw new Error("Duration (in days) must be greater than 0");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
    }
  };

  deleteMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Missing membership id");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid membership id");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
    }
  };

  getMembership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Missing membership id");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid membership id");
      }
      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
    }
  };

  getMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy } = req.query;

      if (page && parseInt(page as string) < 1) {
        throw new Error("Invalid page number");
      }
      if (size && parseInt(size as string) < 1) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
    }
  };
}
export default MembershipDto;
