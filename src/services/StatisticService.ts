import { Inject, Service } from "typedi";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
} from "date-fns";
import { IReceiptRepository } from "../interfaces/repositories/IReceiptRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import ReceiptRepository from "../repositories/ReceiptRepository";
import { INewUsers, IRevenue } from "../interfaces/others/IStatisticData";
import { IStatisticService } from "../interfaces/services/IStatisticService";
import { RevenueTimeEnum } from "../enums/RevenueTimeEnum";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IUser } from "../interfaces/models/IUser";

@Service()
class StatisticService implements IStatisticService {
  constructor(
    @Inject(() => ReceiptRepository)
    private receiptRepository: IReceiptRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository
  ) {}
  getRevenueOverTime = async (
    time: string,
    value?: number
  ): Promise<IRevenue[]> => {
    try {
      const today = new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );

      let firstDay: Date, lastDay: Date, interval: number, groupBy: string;

      let formatedValue: number = today.getUTCFullYear();

      switch (time) {
        case RevenueTimeEnum.DAY:
          firstDay = new Date(today.setUTCHours(0, 0, 0, 0));
          lastDay = new Date(today.setUTCHours(23, 59, 59, 999));
          interval = 1;
          groupBy = "%Y-%m-%d";
          break;

        case RevenueTimeEnum.WEEK:
          firstDay = startOfWeek(today.setUTCHours(0, 0, 0, 0), {
            weekStartsOn: 1,
          });
          lastDay = endOfWeek(today.setUTCHours(23, 59, 59, 999), {
            weekStartsOn: 1,
          });
          interval = 7;
          groupBy = "%Y-%m-%d";
          break;

        case RevenueTimeEnum.MONTH:
          formatedValue = value ? value - 1 : today.getUTCMonth();
          firstDay = startOfMonth(
            new Date(today.getUTCFullYear(), formatedValue)
          );
          lastDay = endOfMonth(new Date(today.getUTCFullYear(), formatedValue));
          interval = new Date(
            today.getUTCFullYear(),
            formatedValue + 1,
            0
          ).getDate();
          groupBy = "%Y-%m-%d";
          break;

        case RevenueTimeEnum.YEAR:
          formatedValue = value || today.getUTCFullYear();
          firstDay = startOfYear(new Date(Date.UTC(formatedValue, 0, 1)));
          lastDay = endOfYear(new Date(Date.UTC(formatedValue, 11, 31)));
          interval = 12;
          groupBy = "%Y-%m-01";
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Unsupported time type"
          );
      }

      const receipts = await this.receiptRepository.getRevenueByTimeInterval(
        firstDay,
        lastDay,
        groupBy
      );

      const revenueMap = new Map<string, number>();
      receipts.forEach((r) => revenueMap.set(r.Date, r.Revenue));

      const revenue: IRevenue[] = [];
      for (let i = 0; i < interval; i++) {
        const date =
          time === "YEAR"
            ? new Date(Date.UTC(formatedValue, i, 1))
            : addDays(firstDay, i);
        const dateKey = date.toISOString().split("T")[0];
        revenue.push({
          Date: dateKey,
          Revenue: revenueMap.get(dateKey) || 0,
        });
      }

      return revenue;
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getNewUsers = async (time: string, value?: number): Promise<INewUsers[]> => {
    try {
      const today = new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );
      let firstDay, lastDay;
      let interval: number;
      let newUsers = [];
      let formatedValue;
      let groupBy;

      switch (time) {
        case RevenueTimeEnum.DAY:
          firstDay = new Date(today.setUTCHours(0, 0, 0, 0));
          lastDay = new Date(today.setUTCHours(23, 59, 59, 999));
          interval = 1;
          groupBy = "%Y-%m-%d";
          break;

        case RevenueTimeEnum.WEEK:
          firstDay = startOfWeek(today.setUTCHours(0, 0, 0, 0), {
            weekStartsOn: 1,
          });
          lastDay = endOfWeek(today.setUTCHours(23, 59, 59, 999), {
            weekStartsOn: 1,
          });
          interval = 7;
          groupBy = "%Y-%m-%d";
          break;
        case RevenueTimeEnum.MONTH:
          formatedValue = value ? value - 1 : today.getMonth();
          firstDay = new Date(
            startOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formatedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          lastDay = new Date(
            endOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formatedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          interval = new Date(
            today.getFullYear(),
            formatedValue + 1,
            0
          ).getDate();
          groupBy = "%Y-%m-%d";
          break;
        case RevenueTimeEnum.YEAR:
          formatedValue = value ? value : today.getUTCFullYear();
          firstDay = startOfYear(
            new Date(Date.UTC(Number(formatedValue), 0, 2))
          );
          lastDay = endOfYear(
            new Date(Date.UTC(Number(formatedValue), 11, 31))
          );

          interval = 12;
          groupBy = "%Y-%m-01";
          break;
        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Unsupported time type"
          );
      }
      const users = await this.userRepository.getAllUsersTimeInterval(
        firstDay as Date,
        lastDay as Date,
        groupBy
      );
      const userMap = new Map<string, number>();
      users.forEach((u) => userMap.set(u.Date, u.newUsers));

      newUsers = [];
      for (let i = 0; i < interval; i++) {
        const date =
          time === RevenueTimeEnum.YEAR
            ? new Date(
                Date.UTC(Number(formatedValue ?? today.getUTCFullYear()), i, 1)
              )
            : addDays(firstDay, i);
        const dateKey = date.toISOString().split("T")[0];
        newUsers.push({
          Date: dateKey,
          newUsers: userMap.get(dateKey) || 0,
        });
      }

      return newUsers;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default StatisticService;
