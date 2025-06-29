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
import { INewUsers, IRevenue, IUserStatistics } from "../interfaces/others/IStatisticData";
import { IStatisticService } from "../interfaces/services/IStatisticService";
import RevenueTimeEnum from "../enums/RevenueTimeEnum";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IUser } from "../interfaces/models/IUser";
import UserCourseRepository from "../repositories/UserCourseRepository";
import { IUserCourseRepository } from "../interfaces/repositories/IUserCourseRepository";
import UserLessonRepository from "../repositories/UserLessonRepository";
import { IUserLessonRepository } from "../interfaces/repositories/IUserLessonRepository";
import UserTestRepository from "../repositories/UserTestRepository";
import { IUserTestRepository } from "../interfaces/repositories/IUserTestRepository";

@Service()
class StatisticService implements IStatisticService {
  constructor(
    @Inject(() => ReceiptRepository)
    private receiptRepository: IReceiptRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository,
    @Inject(() => UserCourseRepository)
    private userCourseRepository: IUserCourseRepository,
    @Inject(() => UserLessonRepository)
    private userLessonRepository: IUserLessonRepository,
    @Inject(() => UserTestRepository)
    private userTestRepository: IUserTestRepository
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

      let formattedValue: number = today.getUTCFullYear();

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
          formattedValue = value ? value - 1 : today.getUTCMonth();
          firstDay = startOfMonth(
            new Date(today.getUTCFullYear(), formattedValue)
          );
          lastDay = endOfMonth(new Date(today.getUTCFullYear(), formattedValue));
          interval = new Date(
            today.getUTCFullYear(),
            formattedValue + 1,
            0
          ).getDate();
          groupBy = "%Y-%m-%d";
          break;

        case RevenueTimeEnum.YEAR:
          formattedValue = value || today.getUTCFullYear();
          firstDay = startOfYear(new Date(Date.UTC(formattedValue, 0, 1)));
          lastDay = endOfYear(new Date(Date.UTC(formattedValue, 11, 31)));
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
          time === RevenueTimeEnum.YEAR
            ? new Date(Date.UTC(formattedValue, i, 1))
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
      let formattedValue;
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
          formattedValue = value ? value - 1 : today.getMonth();
          firstDay = new Date(
            startOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formattedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          lastDay = new Date(
            endOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formattedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          interval = new Date(
            today.getFullYear(),
            formattedValue + 1,
            0
          ).getDate();
          groupBy = "%Y-%m-%d";
          break;
        case RevenueTimeEnum.YEAR:
          formattedValue = value ? value : today.getUTCFullYear();
          firstDay = startOfYear(
            new Date(Date.UTC(Number(formattedValue), 0, 2))
          );
          lastDay = endOfYear(
            new Date(Date.UTC(Number(formattedValue), 11, 31))
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
                Date.UTC(Number(formattedValue ?? today.getUTCFullYear()), i, 1)
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

  getUserStatistics = async (userId: string): Promise<IUserStatistics> => {
    try {
      // Get user to verify existence
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "User not found");
      }

      // Get completed courses count
      const completedCourses = await this.userCourseRepository.countCompletedByUserId(userId);
      
      // Get completed lessons count
      const completedLessons = await this.userLessonRepository.countCompletedByUserId(userId);
      
      // Get completed tests count
      const completedTests = await this.userTestRepository.countCompletedByUserId(userId);
      
      // Return user statistics
      return {
        totalPoints: user.points || 0,
        completedCourses,
        completedLessons,
        completedTests
      };
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

  getCompletionRate = async (): Promise<number> => {
    try {
      // Get all user courses
      const userCourses = await this.userCourseRepository.getAllUserCourses();
      
      if (userCourses.length === 0) {
        return 0;
      }

      // Count completed courses
      const completedCourses = userCourses.filter((uc: any) => uc.progress === 100).length;
      
      // Calculate completion rate as a percentage
      const completionRate = (completedCourses / userCourses.length) * 100;
      
      return Math.round(completionRate * 10) / 10; // Round to 1 decimal place
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
}

export default StatisticService;
