import "reflect-metadata";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import getLogger from "./utils/logger";
import { swaggerDoc } from "./configs/swaggerConfig";
import http from "http";
import path from "path";

//routes
import authRoutes from "./routes/AuthRoute";
import userRoutes from "./routes/UserRoute";
import achievementRoutes from "./routes/AchievementRoute";
import userAchievementRoutes from "./routes/UserAchievementRoute";
import membershipRoutes from "./routes/MembershipRoute";

//middlewares
import ErrorLogMiddleware from "./middlewares/ErrorLogMiddleware";
import receiptRoutes from "./routes/ReceiptRoute";
import paymentRoutes from "./routes/PaymentRoute";
import cronJob from "./utils/cronJob";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

app.use(helmet());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL as string],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/user-achievements", userAchievementRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const logger = getLogger("API");

  const startTime = new Date();

  res.on("finish", () => {
    const duration = new Date().getTime() - startTime.getTime();
    const logMessage = `${req.ip} ${req.method} ${
      req.originalUrl
    } ${req.protocol.toUpperCase()}/${req.httpVersion} ${res.statusCode} ${
      res.get("Content-Length") || 0
    } ${req.get("User-Agent")} ${duration}ms`;
    logger.info(logMessage);
  });

  next();
});
app.use(ErrorLogMiddleware);

cronJob.start();
const server = http.createServer(app);

server.listen(PORT, async (err?: Error) => {
  const logger = getLogger("APP");
  if (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  } else {
    logger.info(`Server is running at port ${PORT}`);
    swaggerDoc(app);
  }
});
