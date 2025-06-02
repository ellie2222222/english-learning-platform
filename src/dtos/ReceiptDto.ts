import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import mongoose from "mongoose";
import { PaymentMethodEnum } from "../enums/PaymentMethodEnum";
import { PaymentGatewayEnum } from "../enums/PaymentGatewayEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

class ReceiptDto {
  createReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, userId, membershipId, paymentMethod, paymentGateway } =
        req.body;

      if (
        !amount ||
        !userId ||
        !membershipId ||
        !paymentMethod ||
        !paymentGateway
      ) {
        throw new Error("Missing required field");
      }

      if (parseFloat(amount) <= 0) {
        throw new Error("Invalid amount");
      }

      if (!mongoose.isValidObjectId(userId)) {
        throw new Error("Invalid user id");
      }

      if (!mongoose.isValidObjectId(membershipId)) {
        throw new Error("Invalid membership id");
      }

      if (!Object.values(PaymentMethodEnum).includes(paymentMethod)) {
        throw new Error("Invalid payment method");
      }

      if (!Object.values(PaymentGatewayEnum).includes(paymentGateway)) {
        throw new Error("Invalid payment gateway");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Receipt id required");
      }
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid receipt id");
      }
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };

  getReceipts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy } = req.query;

      const { id } = req.params;

      if (!id) {
        throw new Error("User ID is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid user id");
      }

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
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: (error as Error).message,
      });
    }
  };
}
export default ReceiptDto;
