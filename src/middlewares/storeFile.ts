import multer from "multer";
import path from "path";
import fs from "fs";
import getLogger from "../utils/logger";
import dotenv from "dotenv";
import { fileFilter, localStorage } from "../configs/uploadFileConfig";
const logger = getLogger("FILE_UPLOAD");
dotenv.config();

const checkFileSuccess = async (filePath: string) => {
  logger.info(`Checking file ${filePath} for success...`);
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;

    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        logger.error(`Failed to read directory ${dirPath}: ${err.message}`);
        return reject(err);
      }
      for (const file of files) {
        const existingBaseName = path.parse(file).name;
        logger.info(`Existing Base Name: ${existingBaseName}`);
        if (existingBaseName !== baseName) {
          const existingFilePath = path.join(dirPath, file);
          try {
            await deleteFile(existingFilePath);
          } catch (unlinkErr) {
            return reject(unlinkErr);
          }
        }
      }
    });
    resolve(true);
  });
};

const deleteFile = async (filePath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Failed to delete file ${filePath}: ${err.message}`);
        return reject(err); // Reject the promise with the error
      }
      logger.info(`Delete file ${filePath} successfully`);
      resolve(); // Resolve the promise on success
    });
  });
};

const deleteFolder = async (folderPath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.rm(folderPath, { recursive: true }, (err) => {
      if (err) {
        logger.error(`Failed to delete folder ${folderPath}: ${err.message}`);
        return reject(err);
      }
      logger.info(`Delete folder ${folderPath} successfully`);
      resolve();
    });
  });
};

const storage = localStorage;
const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export { uploadFile, deleteFile, deleteFolder, checkFileSuccess };
