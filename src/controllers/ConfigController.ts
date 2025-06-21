import { Inject, Service } from "typedi";
import ConfigService from "../services/ConfigService";
import { IConfigService } from "../interfaces/services/IConfigService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";

@Service()
class ConfigController {
  constructor(
    @Inject(() => ConfigService) private configService: IConfigService
  ) {}

  getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.id;
      const config = await this.configService.getConfig(key);
      res
        .status(StatusCodeEnum.OK_200)
        .json({ config: config, message: "Config retrieved successfully" });
    } catch (error) {
      next(error);
    }
  };

  getConfigs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const configs = await this.configService.getConfigs();
      res
        .status(StatusCodeEnum.OK_200)
        .json({ configs: configs, message: "Configs retrieved successfully" });
    } catch (error) {
      next(error);
    }
  };

  createConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value, description } = req.body;
      const config = await this.configService.createConfig(
        key,
        value,
        description
      );
      res
        .status(StatusCodeEnum.Created_201)
        .json({ config: config, message: "Config created successfully" });
    } catch (error) {
      next(error);
    }
  };

  updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.id;
      const { value, description } = req.body;
      const config = await this.configService.updateConfig(
        key,
        value,
        description
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ config: config, message: "Config updated successfully" });
    } catch (error) {
      next(error);
    }
  };
}
export default ConfigController;
