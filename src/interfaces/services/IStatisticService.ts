import { INewUsers, IRevenue } from "../others/IStatisticData";

export interface IStatisticService {
  getRevenueOverTime: (time: string, value?: number) => Promise<IRevenue[]>;
  getNewUsers: (time: string, value?: number) => Promise<INewUsers[]>;
}
