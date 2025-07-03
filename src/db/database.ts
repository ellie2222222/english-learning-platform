import mongoose from "mongoose";
import getLoggers from "../utils/logger";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";

import dotenv from "dotenv";
import path from "path";
import { Service } from "typedi";
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
});
const logger = getLoggers("MONGOOSE");

@Service()
class Database {
  private static instance: Database | null = null;

  private constructor() {
    this.connect().catch((error) => {
      logger.error(
        `Database connection error during constructor: ${error.message}`
      );
    });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Connect to MongoDB
  private async connect(): Promise<void> {
    try {
      if (!process.env.DATABASE_URI || !process.env.DATABASE_NAME) {
        logger.error(
          "Missing required environment variables: DATABASE_URI or DATABASE_NAME"
        );
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "Internal Server Error"
        );
      }
      const URI: string = process.env.DATABASE_URI!;
      const DBName: string = process.env.DATABASE_NAME!;

      await mongoose.connect(URI, { dbName: DBName });
      logger.info(`Successfully connected to the database ${DBName}`);
    } catch (error) {
      logger.error(
        `Database connection error: ${
          (error as Error | CustomException).message
        }`
      );
      if (error as Error | CustomException) {
        throw error;
      }
    }
  }

  // Start a new database transaction
  public async startTransaction(): Promise<mongoose.ClientSession> {
    try {
      const session = await mongoose.startSession();
      await session.startTransaction();
      return session;
    } catch (error) {
      logger.error(
        "Error starting transaction:",
        (error as Error | CustomException).message
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    }
  }

  // Commit the transaction
  public async commitTransaction(
    session: mongoose.ClientSession
  ): Promise<void> {
    if (!session || !session.inTransaction()) {
      logger.warn("No active transaction to commit");
      return;
    }

    try {
      await session.commitTransaction();
      logger.info("Transaction committed successfully");
    } catch (error) {
      logger.error(
        "Error committing transaction:",
        (error as Error | CustomException).message
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    }
  }

  // Abort the transaction
  public async abortTransaction(
    session: mongoose.ClientSession
  ): Promise<void> {
    if (!session || !session.inTransaction()) {
      logger.warn("No active transaction to abort");
      return;
    }

    try {
      await session.abortTransaction();
      logger.info("Transaction aborted successfully");
    } catch (error) {
      logger.error(
        "Error aborting transaction:",
        (error as Error | CustomException).message
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    }
  }

  // End the session
  public async endSession(session: mongoose.ClientSession): Promise<void> {
    if (!session) {
      logger.warn("No session to end");
      return;
    }

    try {
      await session.endSession();
      logger.info("Session ended successfully");
    } catch (error) {
      logger.error(
        `Error ending session: ${(error as Error | CustomException).message}`
      );
      // Don't throw here, just log the error
      logger.warn("Failed to end session, but continuing execution");
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      logger.info("Disconnected from the database.");
    } catch (error) {
      logger.error(
        `Error disconnecting from database: ${
          (error as Error | CustomException).message
        }`
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    }
  }
}

export default Database;

