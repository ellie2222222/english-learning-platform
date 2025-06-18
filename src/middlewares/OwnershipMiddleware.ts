import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserTestModel from "../models/UserTestModel";
import UserCourseModel from "../models/UserCourseModel";
import UserLessonModel from "../models/UserLessonModel";
import { ResourceModel } from "../enums/ResourceModelEnum";

const OwnershipMiddleware = (model: ResourceModel) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userInfo || !req.userInfo.userId) {
        throw new CustomException(
          StatusCodeEnum.Unauthorized_401,
          "User not authenticated"
        );
      }

      const userId = req.userInfo.userId;
      const resourceId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid resource ID"
        );
      }

      let resource: any = null;

      switch (model) {
        case ResourceModel.USER_COURSE:
          resource = await UserCourseModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
          }).exec();
          break;

        case ResourceModel.USER_LESSON:
          resource = await UserLessonModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
          }).exec();

          break;

        case ResourceModel.USER_TEST:
          resource = await UserTestModel.findOne({
            _id: new mongoose.Types.ObjectId(resourceId),
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
          }).exec();
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Invalid resource model"
          );
      }

      if (!resource) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have permission to access this resource"
        );
      }

      next();
    } catch (error) {
      if (error instanceof CustomException) {
        res.status(error.code).json({
          code: error.code,
          message: error.message,
        });
      } else {
        res.status(StatusCodeEnum.InternalServerError_500).json({
          code: StatusCodeEnum.InternalServerError_500,
          message:
            error instanceof Error ? error.message : "Internal Server Error",
        });
      }
    }
  };
};

export { OwnershipMiddleware, ResourceModel };
