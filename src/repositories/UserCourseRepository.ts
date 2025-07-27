import mongoose, { ClientSession } from "mongoose";
import { IUserCourse } from "../interfaces/models/IUserCourse";
import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Service } from "typedi";
import { IPagination } from "../interfaces/others/IPagination";
import { IUserCourseRepository } from "../interfaces/repositories/IUserCourseRepository";
import UserCourseModel from "../models/UserCourseModel";
import TestModel from "../models/TestModel";
import {
  UserCourseStatus,
  UserCourseStatusType,
} from "../enums/UserCourseStatus";
import { IUserLesson } from "../interfaces/models/IUserLesson";
import { UserLessonStatus } from "../enums/UserLessonStatus";

@Service()
class UserCourseRepository implements IUserCourseRepository {
  async createUserCourse(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse> {
    try {
      const userCourse = await UserCourseModel.create([data], { session });
      return userCourse[0];
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

  async updateUserCourse(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse | null> {
    try {
      const userCourse = await UserCourseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        { ...data },
        { session, new: true }
      );
      if (!userCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserCourse not found"
        );
      }
      return userCourse;
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

  async deleteUserCourse(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse | null> {
    try {
      const userCourse = await UserCourseModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );
      if (!userCourse) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserCourse not found"
        );
      }
      return userCourse;
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

  async getAllUserCourses(): Promise<IUserCourse[]> {
    try {
      const userCourses = await UserCourseModel.find({ isDeleted: false });
      return userCourses;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getUserCourseById(id: string): Promise<IUserCourse | null> {
    try {
      const matchQuery = {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      };
      const userCourse = await UserCourseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
      ]);

      if (!userCourse || userCourse.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "UserCourse not found"
        );
      }

      return userCourse[0];
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

  async getUserCoursesByUserId(
    userId: string,
    query: IQuery
  ): Promise<IPagination> {
    try {
      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      };
      let sortField = "createdAt";
      switch (query.sortBy) {
        case SortByType.DATE:
          sortField = "createdAt";
          break;
        case SortByType.NAME:
          sortField = "name";
          break;
        default:
          break;
      }
      const sortOrder: 1 | -1 = query.order === OrderType.ASC ? 1 : -1;
      const skip = (query.page - 1) * query.size;

      const userCourses = await UserCourseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        { $skip: skip },
        { $limit: query.size },
      ]);

      const total = await UserCourseModel.countDocuments(matchQuery);

      return {
        data: userCourses,
        page: query.page,
        total: total,
        totalPages: Math.ceil(total / query.size),
      };
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

  async getAllUserCourseForAchievements(userId: string): Promise<void> {
    try {
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

  async getUserProgressHierarchy(userId: string): Promise<object[]> {
    try {
      // Build the match stage to filter by userId if provided
      const matchStage = userId
        ? { userId: new mongoose.Types.ObjectId(userId), isDeleted: false }
        : {};

      const aggregation = await UserCourseModel.aggregate([
        // Match user courses
        { $match: matchStage },

        // Lookup Course details
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },

        // Lookup User details (optional)
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        // Lookup Lessons for the course
        {
          $lookup: {
            from: "lessons",
            localField: "courseId",
            foreignField: "courseId",
            as: "lessons",
          },
        },
        // Sort lessons by order
        {
          $addFields: {
            lessons: {
              $sortArray: { input: "$lessons", sortBy: { order: 1 } },
            },
          },
        },

        // Lookup UserTests for the user and course
        {
          $lookup: {
            from: "usertests",
            let: { userId: "$userId", courseId: "$courseId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$userId"],
                  },
                },
              },
              // Lookup Test details
              {
                $lookup: {
                  from: "tests",
                  localField: "testId",
                  foreignField: "_id",
                  as: "test",
                },
              },
              { $unwind: "$test" },
              // Filter tests by courseId and isDeleted
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$test.courseId", "$$courseId"] },
                      { $eq: ["$test.isDeleted", false] },
                    ],
                  },
                },
              },
              // Lookup Lessons for each Test
              {
                $lookup: {
                  from: "lessons",
                  localField: "test.lessonIds",
                  foreignField: "_id",
                  as: "test.lessons",
                },
              },
            ],
            as: "userTests",
          },
        },

        // Project the desired fields
        {
          $project: {
            _id: 1,
            user: {
              _id: "$user._id",
              username: "$user.username",
            },
            course: {
              _id: "$course._id",
              name: "$course.name",
              description: "$course.description",
              level: "$course.level",
              type: "$course.type",
              totalLessons: "$course.totalLessons",
              coverImage: "$course.coverImage",
            },
            lessonFinished: 1,
            averageScore: 1,
            status: 1,
            lessons: {
              $map: {
                input: "$lessons",
                as: "lesson",
                in: {
                  _id: "$$lesson._id",
                  name: "$$lesson.name",
                  description: "$$lesson.description",
                  length: "$$lesson.length",
                  order: "$$lesson.order",
                  completed: {
                    $lte: ["$$lesson.order", "$lessonFinished"],
                  },
                },
              },
            },
            userTests: {
              $map: {
                input: "$userTests",
                as: "userTest",
                in: {
                  _id: "$$userTest._id",
                  test: {
                    _id: "$$userTest.test._id",
                    name: "$$userTest.test.name",
                    description: "$$userTest.test.description",
                    totalQuestions: "$$userTest.test.totalQuestions",
                    order: "$$userTest.test.order",
                    lessons: {
                      $map: {
                        input: "$$userTest.test.lessons",
                        as: "lesson",
                        in: {
                          _id: "$$lesson._id",
                          name: "$$lesson.name",
                          order: "$$lesson.order",
                        },
                      },
                    },
                  },
                  attemptNo: "$$userTest.attemptNo",
                  score: "$$userTest.score",
                  status: "$$userTest.status",
                  description: "$$userTest.description",
                },
              },
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

      if (!aggregation || aggregation.length === 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Not enough data to generate progress hierarchy"
        );
      }
      return aggregation;
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

  async getUserCourseForAchievement(
    userId: string,
    session?: ClientSession
  ): Promise<IUserCourse[]> {
    try {
      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        status: UserCourseStatus.COMPLETED,
      };
      const userCourses = await UserCourseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
      ]).session(session ?? null);
      return userCourses;
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

  async getUserCourseByCourseId(
    id: string,
    requesterId: string
  ): Promise<IUserCourse | null> {
    try {
      const matchQuery = {
        courseId: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(requesterId),
        isDeleted: false,
      };
      const userCourse = await UserCourseModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.resetPasswordPin": 0,
          },
        },
      ]);

      if (!userCourse || userCourse.length === 0) {
        return null;
      }

      return userCourse[0];
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

  // Add the countCompletedByUserId method
  countCompletedByUserId = async (userId: string): Promise<number> => {
    try {
      const count = await UserCourseModel.countDocuments({
        userId,
        status: UserCourseStatus.COMPLETED,
      });

      return count;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error counting completed courses:", error.message);
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Error counting completed courses"
      );
    }
  };

  completeCourseLogic = async (
    userId: string,
    courseId: string,
    newStatus: UserCourseStatusType,
    userLessons: IUserLesson[],
    averageScore?: number,
    session?: mongoose.ClientSession
  ): Promise<IUserCourse> => {
    try {
      const data: {
        status: UserCourseStatusType;
        lessonFinished: number;
        averageScore?: number;
      } = {
        status: newStatus,
        lessonFinished: userLessons.filter(
          (ul) => ul.status === UserLessonStatus.COMPLETED
        ).length,
      };

      if (averageScore && averageScore !== undefined) {
        data.averageScore = averageScore;
      }
      const userCourse = await UserCourseModel.findOneAndUpdate(
        {
          userId: new mongoose.Types.ObjectId(userId),
          courseId: new mongoose.Types.ObjectId(courseId),
        },
        {
          $set: data,
        },
        { upsert: true, new: true, session }
      );

      return userCourse;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  async countActiveCourses(): Promise<number> {
    try {
      const result = await UserCourseModel.aggregate([
        { $match: { status: 'ongoing', isDeleted: false } },
        { $group: { _id: '$courseId' } },
        { $count: 'activeCourses' }
      ]);
      return result[0]?.activeCourses || 0;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}

export default UserCourseRepository;
