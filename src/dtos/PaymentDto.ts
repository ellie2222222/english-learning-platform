import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Request, Response, NextFunction } from "express";
import { PlatformEnum } from "../enums/PlatformEnum";

class PaymentDto {
  createPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { membershipId, platform } = req.body;
      if (!membershipId || !platform) {
        throw new Error("Missing required field");
      }

      if (!mongoose.isValidObjectId(membershipId)) {
        throw new Error("Invalid membership id");
      }

      if (!Object.values(PlatformEnum).includes(platform)) {
        throw new Error("Invalid platform");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  createVNPayPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { membershipId, platform } = req.body;
      if (!membershipId || !platform) {
        throw new Error("Missing required field");
      }

      if (!mongoose.isValidObjectId(membershipId)) {
        throw new Error("Invalid membership id");
      }

      if (!Object.values(PlatformEnum).includes(platform)) {
        throw new Error("Invalid platform");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };
}

export default PaymentDto;
