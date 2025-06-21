import { Inject, Service } from "typedi";
import ConfigRepository from "../repositories/ConfigRepository";
import { IConfigRepository } from "../interfaces/repositories/IConfigRepository";
import { IConfigService } from "../interfaces/services/IConfigService";
import { IConfig } from "../interfaces/models/IConfig";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";

import Database from "../db/database";

@Service()
class ConfigService implements IConfigService {
  constructor(
    @Inject(() => ConfigRepository) private configRepository: IConfigRepository,
    @Inject() private database: Database
  ) {}

  getConfig = async (key: string): Promise<IConfig> => {
    try {
      const config = await this.configRepository.getConfig(key);

      if (!config) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Config with key ${key} not found
            `
        );
      }
      return config;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "InternalServerError"
      );
    }
  };

  getConfigs = async (): Promise<IConfig[]> => {
    try {
      const configs = await this.configRepository.getConfigs();
      return configs;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "InternalServerError"
      );
    }
  };

  createConfig = async (
    key: string,
    value: number,
    description?: string
  ): Promise<IConfig> => {
    const session = await this.database.startTransaction();
    try {
      const config = await this.configRepository.getConfig(key);

      if (config) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Config with key ${key} already existed`
        );
      }

      const newConfig = await this.configRepository.createConfig(
        {
          key,
          value: String(value),
          description,
        },
        session
      );

      await this.database.commitTransaction(session);
      return newConfig;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "InternalServerError"
      );
    }
  };

  updateConfig = async (
    key: string,
    value?: number,
    description?: string
  ): Promise<IConfig> => {
    const session = await this.database.startTransaction();
    try {
      const config = await this.configRepository.getConfig(key);
      if (!config) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          `Config with key ${key} not found`
        );
      }

      const data: {
        value?: string;
        description?: string;
      } = {};

      if (value && value !== parseFloat(config.value)) {
        data.value = String(value);
      }

      if (description && description !== config.description) {
        data.description = description;
      }

      const updatedConfig = await this.configRepository.updateConfig(key, data);

      await this.database.commitTransaction(session);
      return updatedConfig;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "InternalServerError"
      );
    }
  };
}

export default ConfigService;
