import { Inject, Service } from "typedi";
import { ICourse } from "../interfaces/models/ICourse";
import { ICourseService } from "../interfaces/services/ICourseService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { ICourseRepository } from "../interfaces/repositories/ICourseRepository";
import CourseRepository from "../repositories/CourseRepository";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class CourseService implements ICourseService {
  constructor(
    @Inject(() => CourseRepository)
    private courseRepository: ICourseRepository,
    @Inject() private database: Database
  ) {}

  async createCourse(
    name: string,
    description: string | undefined,
    type: string,
    level: string,
    totalLessons: number | undefined
  ): Promise<ICourse> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.courseRepository.createCourse(
        {
          name,
          description,
          type,
          level,
          totalLessons,
        },
        session
      );

      await this.database.commitTransaction(session);
      return course;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to create course"
      );
    } finally {
      await session.endSession();
    }
  }

  async updateCourse(
    id: string,
    name?: string,
    description?: string,
    type?: string,
    level?: string,
    totalLessons?: number
  ): Promise<ICourse | null> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.courseRepository.getCourseById(id);
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      const updateData: Partial<ICourse> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (level !== undefined) updateData.level = level;
      if (totalLessons !== undefined) updateData.totalLessons = totalLessons;

      const updatedCourse = await this.courseRepository.updateCourse(
        id,
        updateData,
        session
      );
      if (!updatedCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      await this.database.commitTransaction(session);
      return updatedCourse;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to update course"
      );
    } finally {
      await session.endSession();
    }
  }

  async deleteCourse(id: string): Promise<ICourse | null> {
    const session = await this.database.startTransaction();
    try {
      const course = await this.courseRepository.getCourseById(id);
      if (!course) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Course not found"
        );
      }

      const deletedCourse = await this.courseRepository.deleteCourse(
        id,
        session
      );
      await this.database.commitTransaction(session);
      return deletedCourse;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to delete course"
      );
    } finally {
      await session.endSession();
    }
  }

  async getCourseById(id: string): Promise<ICourse | null> {
    try {
      const course = await this.courseRepository.getCourseById(id);
      return course;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve course"
      );
    }
  }

  async getCourses(query: IQuery, type?: string): Promise<IPagination> {
    try {
      const courses = await this.courseRepository.getCourses(query, type);
      return courses;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Failed to retrieve courses"
      );
    }
  }
}

export default CourseService;
