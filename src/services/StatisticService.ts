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
import CourseRepository from "../repositories/CourseRepository";
import { ICourseRepository } from "../interfaces/repositories/ICourseRepository";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

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
    private userTestRepository: IUserTestRepository,
    @Inject(() => CourseRepository)
    private courseRepository: ICourseRepository
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
      
      // Debug logging
      console.log('Backend Revenue Debug:', {
        requestedMonth: value,
        formattedValue,
        currentTotal: total,
        previousTotal: prevTotal,
        currentPeriod: `${firstDay.toISOString()} to ${lastDay.toISOString()}`,
        previousPeriod: `${prevFirstDay.toISOString()} to ${prevLastDay.toISOString()}`
      });
      
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
      
      // Get completed tests count and calculate average score
      const completedTests = await this.userTestRepository.countCompletedByUserId(userId);
      
      // Get all user tests to calculate average score
      const allUserTests = await this.userTestRepository.getUserTestsByUserId(userId, {
        page: 1,
        size: 1000,
        order: OrderType.DESC,
        sortBy: SortByType.DATE
      });
      
      let averageScore = 0;
      if (allUserTests.data && allUserTests.data.length > 0) {
        const completedTestScores = allUserTests.data
          .filter((test: any) => test.status === "passed" || test.status === "failed")
          .map((test: any) => test.score || 0);
        
        if (completedTestScores.length > 0) {
          averageScore = Number((completedTestScores.reduce((sum, score) => sum + score, 0) / completedTestScores.length).toFixed(2));
        }
      }
      
      // Get flashcards mastered count (placeholder - you may need to implement this)
      const flashcardsMastered = 0; // TODO: Implement flashcard statistics
      
      // Return user statistics
      return {
        totalPoints: user.points || 0,
        completedCourses,
        completedLessons,
        completedTests,
        averageScore,
        flashcardsMastered
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

  getCompletionRate = async (): Promise<{ currentRate: number; previousRate: number; trend: number }> => {
    try {
      const today = new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );
      const currentMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      const currentMonthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      
      const lastMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
      const lastMonthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0, 23, 59, 59, 999));

      // Get all user courses for current month and last month
      const userCoursesCurrentMonth = await this.userCourseRepository.getAllUserCourses();
      const userCoursesLastMonth = await this.userCourseRepository.getAllUserCourses();

      // Filter by date range
      const currentMonthCourses = userCoursesCurrentMonth.filter((uc: any) => {
        const createdAt = new Date(uc.createdAt);
        return createdAt >= currentMonthStart && createdAt <= currentMonthEnd;
      });

      const lastMonthCourses = userCoursesLastMonth.filter((uc: any) => {
        const createdAt = new Date(uc.createdAt);
        return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
      });

      // Calculate completion rates
      const completedCoursesCurrentMonth = currentMonthCourses.filter((uc: any) => uc.status === "completed").length;
      const completedCoursesLastMonth = lastMonthCourses.filter((uc: any) => uc.status === "completed").length;
      
      const currentRate = currentMonthCourses.length > 0 
        ? (completedCoursesCurrentMonth / currentMonthCourses.length) * 100
        : 0;
      
      const previousRate = lastMonthCourses.length > 0 
        ? (completedCoursesLastMonth / lastMonthCourses.length) * 100
        : 0;

      // Calculate trend
      const trend = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;
      
      return {
        currentRate: Math.round(currentRate * 10) / 10, // Round to 1 decimal place
        previousRate: Math.round(previousRate * 10) / 10,
        trend: Math.round(trend * 10) / 10
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

  getActiveCourseCount = async (): Promise<number> => {
    try {
      return await this.courseRepository.countActiveCourses();
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  getTotalUserCount = async (): Promise<number> => {
    try {
      return await this.userRepository.getUsers({ page: 1, size: 1 }).then(result => result.total);
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };
}

export default StatisticService;
