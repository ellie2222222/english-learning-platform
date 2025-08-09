import "reflect-metadata";

import PaymentQueue from "../queue/PaymentQueue";
import PaymentService from "../services/PaymentService";
import Database from "../db/database";
import MembershipRepository from "../repositories/MembershipRepository";
import UserRepository from "../repositories/UserRepository";
import ReceiptRepository from "../repositories/ReceiptRepository";
import getLogger from "../utils/logger";
const database = Database.getInstance();
const membershipRepository = new MembershipRepository();
const userRepository = new UserRepository();
const receiptRepository = new ReceiptRepository();
const paymentService = new PaymentService(
  database,
  membershipRepository,
  userRepository,
  receiptRepository
);
const paymentQueue = new PaymentQueue(paymentService);
const logger = getLogger("PAYMENT_WORKER");

const startWorker = async () => {
  try {
    logger.info("Payment worker is starting...");
    await paymentQueue.consumePaymentData();
    logger.info("Payment worker setup completed - now listening for messages");
  } catch (error) {
    logger.error("Failed to start payment worker:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("Payment worker received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("Payment worker received SIGINT, shutting down gracefully");
  process.exit(0);
});

startWorker();
