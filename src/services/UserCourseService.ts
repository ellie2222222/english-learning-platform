import { Inject, Service } from "typedi";
import { IUserCourse } from "../interfaces/models/IUserCourse";
import { IUserCourseService } from "../interfaces/services/IUserCourseService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import { IUserCourseRepository } from "../interfaces/repositories/IUserCourseRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { ICourseRepository } from "../interfaces/repositories/ICourseRepository";
import CourseRepository from "../repositories/CourseRepository";
import UserRepository from "../repositories/UserRepository";
import { UserCourseStatusType } from "../enums/UserCourseStatus";
import UserCourseRepository from "../repositories/UserCourseRepository";

@Service()
class UserCourseService implements IUserCourseService {
  constructor(
    @Inject(() => UserCourseRepository)
    private userCourseRepository: IUserCourseRepository,
    @Inject(() => CourseRepository)
    private courseRepository: ICourseRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository,
    @Inject() private database: Database
  ) {}

  async createUserCourse(
    userId: string,
    courseId: string,
    currentOrder: number,
    status: string
  ): Promise<IUserCourse> {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const course = await this.courseRepository.getCourseById(courseId);
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      const userCourse = await this.userCourseRepository.createUserCourse(
        {
          userId,
          courseId,
          currentOrder,
          status,
        },
        session
      );

      await this.database.commitTransaction(session);
      return userCourse;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create user course"
      );
    }
  }

  async updateUserCourse(
    userCourseId: string,
    status: string
  ): Promise<IUserCourse | null> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.userCourseRepository.getUserCourseById(
        userCourseId
      );
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User course not found"
        );
      }

      const updateData: Partial<IUserCourse> = {};
      if (status !== undefined)
        updateData.status = status as UserCourseStatusType;

      const updatedUserCourse =
        await this.userCourseRepository.updateUserCourse(
          userCourseId,
          updateData,
          session
        );
      if (!updatedUserCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User course not found"
        );
      }

      await this.database.commitTransaction(session);
      return updatedUserCourse;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update user course"
      );
    }
  }

  async deleteUserCourse(id: string): Promise<IUserCourse | null> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.userCourseRepository.getUserCourseById(id);
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User course not found"
        );
      }

      const deletedUserCourse =
        await this.userCourseRepository.updateUserCourse(
          id,
          { isDeleted: true },
          session
        );
      await this.database.commitTransaction(session);
      return deletedUserCourse;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete user course"
      );
    }
  }

  async getUserCourseById(userCourseId: string): Promise<IUserCourse | null> {
    try {
      const course = await this.userCourseRepository.getUserCourseById(
        userCourseId
      );
      return course;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve user course"
      );
    }
  }

  async getUserCoursesByUserId(
    userId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const courses = await this.userCourseRepository.getUserCoursesByUserId(
        userId,
        query
      );
      return courses;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve user courses"
      );
    }
  }

  getUserCourseByCourseId = async (
    id: string,
    requesterId: string
  ): Promise<IUserCourse | null> => {
    try {
      const userCourse =
        await this.userCourseRepository.getUserCourseByCourseId(
          id,
          requesterId
        );

      if (!userCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User course not found"
        );
      }
      return userCourse;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error
          ? error.message
          : "Failed to retrieve user courses"
      );
    }
  };
}

export default UserCourseService;
