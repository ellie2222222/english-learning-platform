import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import getLogger from "../utils/logger";
import dotenv from "dotenv";
dotenv.config();

type DestinationCallback = (error: Error | null, destination: string) => void;

type FileNameCallback = (error: Error | null, filename: string) => void;

const logger = getLogger("FILE_UPLOAD");

const localStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) => {
    if (process.env.STORAGE_TYPE === "cloudinary") {
      const dir = path.resolve("assets/uploads");

      // Add directory creation for Cloudinary
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          logger.error(
            `Failed to create Cloudinary temp dir ${dir}: ${err.message}`
          );
          return cb(
            new CustomException(
              StatusCodeEnum.InternalServerError_500,
              `${err.message}`
            ),
            ""
          );
        }
        logger.info(`Saving to Cloudinary temp path: ${dir}`);
        cb(null, dir);
      });
      return;
    }

    let dir = "";
    let userId = req.userInfo.userId;

    switch (file.fieldname) {
      case "avatar":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        dir = path.join(`assets/images/${userId}/avatar/`);
        break;

      case "blogAttachments":
        dir = path.join(`assets/images/blogAttachments/`);
        break;

      case "blogCover":
        dir = path.join(`assets/images/blogsCover/`);
        break;

      case "exerciseImage":
        dir = path.join("assets/images/exerciseImage");
        break;

      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(
          new CustomException(
            StatusCodeEnum.BadRequest_400,
            `Unknown field name '${file.fieldname}'`
          ),
          ""
        );
    }

    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        logger.error(`Failed to create directory ${dir}: ${err.message}`);
        return cb(
          new CustomException(
            StatusCodeEnum.InternalServerError_500,
            `${err.message}`
          ),
          ""
        );
      }

      cb(null, dir);
    });
  },
  filename: async (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) => {
    const baseName = req.headers["content-length"] + "_" + Date.now(); // the file is named by the size of the file
    const ext = path.extname(file.originalname);

    let fileName = "";
    let dirPath = "";
    let userId = req.userInfo.userId;

    switch (file.fieldname) {
      case "avatar":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/${userId}/avatar/`);
        break;

      case "blogAttachments":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/blogAttachments`);
        break;

      case "blogCover":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/blogsCover`);
        break;

      case "exerciseImage":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/exerciseImage`);
        break;
      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(new Error(`Unknown field name '${file.fieldname}'`), "");
    }
    cb(null, fileName);
    if (process.env.STORAGE_TYPE === "cloudinary") {
      dirPath = "assets/uploads/";
    }
    logger.info(`Saving file ${fileName} successfully to ${dirPath}`);
  },
});

const allowedFormats = {
  video: {
    regex: /\.(mp4|avi|flv|wmv)$/i,
    mime: ["video/mp4", "video/x-msvideo", "video/x-flv", "video/x-ms-wmv"],
    message: "Allowed formats: mp4, avi, flv, wmv",
  },
  img: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  avatar: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  excelFile: {
    regex: /\.(xls|xlsx)$/i,
    mime: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ],
    message: "Allowed format: xlsx or xls",
  },
  blogAttachments: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  blogCover: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  exerciseImage: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
};

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const fileType =
    allowedFormats[file.fieldname as keyof typeof allowedFormats];

  if (!fileType) {
    return cb(
      new CustomException(
        StatusCodeEnum.BadRequest_400,
        "Invalid file field name."
      )
    );
  }

  const isMimeTypeValid = fileType.mime.includes(file.mimetype);

  const expectedExtension = fileType.regex.test(
    `.${file.mimetype.split("/")[1]}`
  );

  if (isMimeTypeValid && expectedExtension) {
    return cb(null, true);
  } else {
    return cb(
      new CustomException(StatusCodeEnum.BadRequest_400, fileType.message)
    );
  }
};

export { localStorage, fileFilter };
