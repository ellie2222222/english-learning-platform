import mongoose from "mongoose";
import { IConfig } from "../models/IConfig";

export interface IConfigRepository {
  getConfig(key: string): Promise<IConfig | null>;
  getConfigs(): Promise<IConfig[]>;
  createConfig(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IConfig>;

  updateConfig(
    key: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IConfig>;
}
