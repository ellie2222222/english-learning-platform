import mongoose from "mongoose";
import UserModel from "../models/UserModel";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import {
  IncreasePointEnum,
  IncreasePointEnumType,
} from "../enums/IncreasePointEnum";
import ConfigModel from "../models/ConfigModel";
import { ConfigKeyEnum } from "../enums/ConfigKeyEnum";
import { CourseLevelEnum } from "../enums/CourseLevelEnum";
import getLogger from "./logger";

const getKeyFromCourseLevel = (level?: string) => {
  let key;
  switch (level) {
    case CourseLevelEnum.BEGINNER_1:
      key = ConfigKeyEnum.COURSE_COMPLETION_BONUS_A1;
      break;

    case CourseLevelEnum.BEGINNER_2:
      key = ConfigKeyEnum.COURSE_COMPLETION_BONUS_A2;
      break;

    case CourseLevelEnum.INTERMEDIATE_1:
      key = ConfigKeyEnum.COURSE_COMPLETION_BONUS_B1;
      break;

    case CourseLevelEnum.INTERMEDIATE_2:
      key = ConfigKeyEnum.COURSE_COMPLETION_BONUS_B2;
      break;

    case CourseLevelEnum.ADVANCED_1:
      key = ConfigKeyEnum.COURSE_COMPLETION_BONUS_C1;
      break;

    case CourseLevelEnum.ADVANCED_2:
      key = ConfigKeyEnum.COURSE_COMPLETION_BONUS_C2;
      break;

    default:
      key = ConfigKeyEnum.COURSE_COMPLETION_BONUS_A1;
      break;
  }
};

const increaseUserPoint = async (
  userId: string,
  type: IncreasePointEnumType,
  level?: string
) => {
  const user = await UserModel.findOne({
    _id: new mongoose.Types.ObjectId(userId),
  });
  if (!user) {
    throw new CustomException(StatusCodeEnum.NotFound_404, "User not found");
  }

  let config;
  switch (type) {
    case IncreasePointEnum.TEST:
      config = await ConfigModel.findOne({
        key: ConfigKeyEnum.TEST_COMPLETION_BONUS,
      }).select("value");

      break;

    case IncreasePointEnum.LESSON:
      config = await ConfigModel.findOne({
        key: ConfigKeyEnum.LESSON_COMPLETION_BONUS,
      }).select("value");
      break;

    case IncreasePointEnum.COURSE: {
      let key = getKeyFromCourseLevel(level);
      config = await ConfigModel.findOne({
        key: key,
      }).select("value");
      break;
    }

    default:
      break;
  }
  if (!config) {
    const logger = await getLogger("INCREASE_POINT");
    logger.error("Config not found, the default value: 100 will be used");
    config = { value: "100" };
  }
  await UserModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(userId),
    },
    {
      points: user.points + parseFloat(config?.value as string),
    }
  );
};

export default increaseUserPoint;
