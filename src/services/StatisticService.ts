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
  ): Promise<any> => {
    try {
      const today = new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );
      let firstDay, lastDay, prevFirstDay, prevLastDay;
      let interval: number;
      let formattedValue;
      let groupBy;
      let prevValue;

      switch (time) {
        case RevenueTimeEnum.MONTH: {
          formattedValue = value ? value - 1 : today.getMonth();
          const year = today.getUTCFullYear();
          firstDay = new Date(Date.UTC(year, formattedValue, 1));
          lastDay = new Date(Date.UTC(year, formattedValue + 1, 0, 23, 59, 59, 999));
          // Previous month logic
          let prevMonth = formattedValue - 1;
          let prevYear = year;
          if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = year - 1;
          }
          prevFirstDay = new Date(Date.UTC(prevYear, prevMonth, 1));
          prevLastDay = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999));
          interval = new Date(year, formattedValue + 1, 0).getDate();
          groupBy = "%Y-%m-%d";
          break;
        }
        case RevenueTimeEnum.YEAR: {
          formattedValue = value ? value : today.getUTCFullYear();
          firstDay = new Date(Date.UTC(Number(formattedValue), 0, 1));
          lastDay = new Date(Date.UTC(Number(formattedValue), 11, 31, 23, 59, 59, 999));
          prevValue = Number(formattedValue) - 1;
          prevFirstDay = new Date(Date.UTC(prevValue, 0, 1));
          prevLastDay = new Date(Date.UTC(prevValue, 11, 31, 23, 59, 59, 999));
          interval = 12;
          groupBy = "%Y-%m-01";
          break;
        }
        default: {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Unsupported time type"
          );
        }
      }
      // Current period
      const receipts = await this.receiptRepository.getRevenueByTimeInterval(
        firstDay as Date,
        lastDay as Date,
        groupBy
      );
      const revenueMap = new Map<string, number>();
      receipts.forEach((r) => revenueMap.set(r.Date, r.Revenue));
      const breakdown = [];
      for (let i = 0; i < interval; i++) {
        const date =
          time === RevenueTimeEnum.YEAR
            ? new Date(Date.UTC(Number(formattedValue), i, 1))
            : new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), i + 1));
        const dateKey = date.toISOString().split("T")[0];
        breakdown.push({ Date: dateKey, Revenue: revenueMap.get(dateKey) || 0 });
      }
      const total = breakdown.reduce((sum, d) => sum + d.Revenue, 0);
      // Previous period
      const prevReceipts = await this.receiptRepository.getRevenueByTimeInterval(
        prevFirstDay as Date,
        prevLastDay as Date,
        groupBy
      );
      const prevRevenueMap = new Map<string, number>();
      prevReceipts.forEach((r) => prevRevenueMap.set(r.Date, r.Revenue));
      const prevBreakdown = [];
      for (let i = 0; i < interval; i++) {
        const date =
          time === RevenueTimeEnum.YEAR
            ? new Date(Date.UTC(Number(prevValue), i, 1))
            : new Date(Date.UTC(prevFirstDay.getUTCFullYear(), prevFirstDay.getUTCMonth(), i + 1));
        const dateKey = date.toISOString().split("T")[0];
        prevBreakdown.push({ Date: dateKey, Revenue: prevRevenueMap.get(dateKey) || 0 });
      }
      const prevTotal = prevBreakdown.reduce((sum, d) => sum + d.Revenue, 0);
      return {
        current: { breakdown, total },
        previous: { breakdown: prevBreakdown, total: prevTotal }
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

  getNewUsers = async (time: string, value?: number): Promise<any> => {
    try {
      const today = new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );
      let firstDay, lastDay, prevFirstDay, prevLastDay;
      let interval: number;
      let newUsers = [];
      let formattedValue;
      let groupBy;
      let prevValue;

      switch (time) {
        case RevenueTimeEnum.MONTH: {
          formattedValue = value ? value - 1 : today.getMonth();
          const year = today.getUTCFullYear();
          firstDay = new Date(Date.UTC(year, formattedValue, 1));
          lastDay = new Date(Date.UTC(year, formattedValue + 1, 0, 23, 59, 59, 999));
          // Previous month logic
          let prevMonth = formattedValue - 1;
          let prevYear = year;
          if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = year - 1;
          }
          prevFirstDay = new Date(Date.UTC(prevYear, prevMonth, 1));
          prevLastDay = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999));
          interval = new Date(year, formattedValue + 1, 0).getDate();
          groupBy = "%Y-%m-%d";
          break;
        }
        case RevenueTimeEnum.YEAR: {
          formattedValue = value ? value : today.getUTCFullYear();
          firstDay = new Date(Date.UTC(Number(formattedValue), 0, 1));
          lastDay = new Date(Date.UTC(Number(formattedValue), 11, 31, 23, 59, 59, 999));
          prevValue = Number(formattedValue) - 1;
          prevFirstDay = new Date(Date.UTC(prevValue, 0, 1));
          prevLastDay = new Date(Date.UTC(prevValue, 11, 31, 23, 59, 59, 999));
          interval = 12;
          groupBy = "%Y-%m-01";
          break;
        }
        default: {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Unsupported time type"
          );
        }
      }
      // Current period
      const users = await this.userRepository.getAllUsersTimeInterval(
        firstDay as Date,
        lastDay as Date,
        groupBy
      );
      const userMap = new Map<string, number>();
      users.forEach((u) => userMap.set(u.Date, u.newUsers));
      const breakdown = [];
      for (let i = 0; i < interval; i++) {
        const date =
          time === RevenueTimeEnum.YEAR
            ? new Date(Date.UTC(Number(formattedValue), i, 1))
            : new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), i + 1));
        const dateKey = date.toISOString().split("T")[0];
        breakdown.push({ Date: dateKey, newUsers: userMap.get(dateKey) || 0 });
      }
      const total = breakdown.reduce((sum, d) => sum + d.newUsers, 0);
      // Previous period
      const prevUsers = await this.userRepository.getAllUsersTimeInterval(
        prevFirstDay as Date,
        prevLastDay as Date,
        groupBy
      );
      const prevUserMap = new Map<string, number>();
      prevUsers.forEach((u) => prevUserMap.set(u.Date, u.newUsers));
      const prevBreakdown = [];
      for (let i = 0; i < interval; i++) {
        const date =
          time === RevenueTimeEnum.YEAR
            ? new Date(Date.UTC(Number(prevValue), i, 1))
            : new Date(Date.UTC(prevFirstDay.getUTCFullYear(), prevFirstDay.getUTCMonth(), i + 1));
        const dateKey = date.toISOString().split("T")[0];
        prevBreakdown.push({ Date: dateKey, newUsers: prevUserMap.get(dateKey) || 0 });
      }
      const prevTotal = prevBreakdown.reduce((sum, d) => sum + d.newUsers, 0);
      return {
        current: { breakdown, total },
        previous: { breakdown: prevBreakdown, total: prevTotal }
      };
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

  getActiveCourseCount = async (): Promise<number> => {
    return await this.userCourseRepository.countActiveCourses();
  }
}

export default StatisticService;
