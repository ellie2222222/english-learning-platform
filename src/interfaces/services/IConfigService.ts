import { IConfig } from "../models/IConfig";

export interface IConfigService {
  getConfig: (key: string) => Promise<IConfig>;
  getConfigs: () => Promise<IConfig[]>;
  createConfig: (
    key: string,
    value: number,
    description?: string
  ) => Promise<IConfig>;
  updateConfig: (
    key: string,
    value?: number,
    description?: string
  ) => Promise<IConfig>;
}
