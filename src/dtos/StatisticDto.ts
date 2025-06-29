import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import RevenueTimeEnum from "../enums/RevenueTimeEnum";

class StatisticDto {
  getRevenueOverTime = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { time, value } = req.query;
      if (!time) {
        throw new Error("Time type is required");
      }

      const timeValues = Object.values(RevenueTimeEnum) as string[];
      if (!timeValues.includes(time as string)) {
        throw new Error("Invalid time type");
      }

      if (
        time === RevenueTimeEnum.MONTH &&
        value &&
        (parseInt(value as string) < 0 || parseInt(value as string) > 12)
      ) {
        throw new Error("Invalid month value");
      }

      if (
        time === RevenueTimeEnum.YEAR &&
        value &&
        parseInt(value as string) > new Date().getFullYear()
      ) {
        throw new Error("Invalid year value");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
    }
  };

  getNewUsersOvertime = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { time, value } = req.query;
      if (!time) {
        throw new Error("Time type is required");
      }

      const timeValues = Object.values(RevenueTimeEnum) as string[];
      if (!timeValues.includes(time as string)) {
        throw new Error("Invalid time type");
      }

      if (
        time === RevenueTimeEnum.MONTH &&
        value &&
        (parseInt(value as string) < 0 || parseInt(value as string) > 12)
      ) {
        throw new Error("Invalid month value");
      }

      if (
        time === RevenueTimeEnum.YEAR &&
        value &&
        parseInt(value as string) > new Date().getFullYear()
      ) {
        throw new Error("Invalid year value");
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.BadRequest_400)
        .json({ message: (error as Error).message });
    }
  };
}

export default StatisticDto;
