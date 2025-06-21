import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { ConfigKeyEnum } from "../enums/ConfigKeyEnum";

class ConfigDto {
  createConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value, description } = req.body;

      if (!Object.values(ConfigKeyEnum).includes(key)) {
        throw new Error(
          "Invalid key. If this is not an error please adjust the ConfigKeyEnum"
        );
      }

      if (value && parseFloat(value as string) < 0) {
        throw new Error("Value must be a positive number");
      }
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.id;

      if (!key) {
        throw new Error("Key is required");
      }

      if (!Object.values(ConfigKeyEnum).includes(key)) {
        throw new Error(
          "Invalid key. If this is not an error please adjust the ConfigKeyEnum"
        );
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  getConfigs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // No input validation needed for getConfigs as it accepts no parameters
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.id;
      const { value, description } = req.body;

      if (!key) {
        throw new Error("Key is required");
      }

      if (!Object.values(ConfigKeyEnum).includes(key)) {
        throw new Error(
          "Invalid key. If this is not an error please adjust the ConfigKeyEnum"
        );
      }

      if (value && parseFloat(value as string) < 0) {
        throw new Error("Value must be a positive number");
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

export default ConfigDto;
