import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IConfig } from "../interfaces/models/IConfig";
import { IConfigRepository } from "../interfaces/repositories/IConfigRepository";
import ConfigModel from "../models/ConfigModel";
import { Service } from "typedi";

@Service()
class ConfigRepository implements IConfigRepository {
  async getConfig(key: string): Promise<IConfig | null> {
    try {
      const data = await ConfigModel.findOne({ key });
      return data;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve config info: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getConfigs(): Promise<IConfig[]> {
    try {
      const data = await ConfigModel.find();
      return data;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async createConfig(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IConfig> {
    try {
      const config = await ConfigModel.create([data], { session });
      return config[0];
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async updateConfig(
    key: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IConfig> {
    try {
      const config = await ConfigModel.findOneAndUpdate({ key }, data, {
        session,
        new: true,
      });
      if (!config) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Config not found"
        );
      }

      return config;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }
}

export default ConfigRepository;
