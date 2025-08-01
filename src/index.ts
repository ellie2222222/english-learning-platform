import "reflect-metadata";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import getLogger from "./utils/logger";
import { swaggerDoc } from "./configs/swaggerConfig";
import http from "http";
import path from "path";
import cookieParser from "cookie-parser";

import ErrorLogMiddleware from "./middlewares/ErrorLogMiddleware";
import cronJob from "./utils/cronJob";
import authRoutes from "./routes/AuthRoute";
import userRoutes from "./routes/UserRoute";
import achievementRoutes from "./routes/AchievementRoute";
import userAchievementRoutes from "./routes/UserAchievementRoute";
import membershipRoutes from "./routes/MembershipRoute";
import blogRoutes from "./routes/BlogRoute";
import courseRoutes from "./routes/CourseRoute";
import lessonRoutes from "./routes/LessonRoute";
import flashcardSetRoutes from "./routes/FlashcardSetRoute";
import flashcardRoutes from "./routes/FlashcardRoute";
import testRoutes from "./routes/TestRoute";
import receiptRoutes from "./routes/ReceiptRoute";
import paymentRoutes from "./routes/PaymentRoute";
import exerciseRoutes from "./routes/ExerciseRoute";
import userExerciseRoutes from "./routes/UserExerciseRoute";
import userCourseRoutes from "./routes/UserCourseRoute";
import userLessonRoutes from "./routes/UserLessonRoute";
import userTestRoutes from "./routes/UserTestRoute";
import grammarRoutes from "./routes/GrammarRoute";
import vocabularyRoutes from "./routes/VocabularyRoute";
import aiRoutes from "./routes/AIRoutes";
import StatusCodeEnum from "./enums/StatusCodeEnum";
import statisticRoutes from "./routes/StatisticRoute";
import configRoutes from "./routes/ConfigRoute";
import session from "express-session";
import passport from "./configs/passportConfig";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/assets", express.static(path.join(__dirname, "..", "assets")));
app.use(cookieParser());

app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL as string,
      process.env.MOBILE_URL as string,
      "http://localhost:3000",
      "http://localhost:8081",
    ],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/user-achievements", userAchievementRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/flashcard-sets", flashcardSetRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/user-exercises", userExerciseRoutes);
app.use("/api/user-courses", userCourseRoutes);
app.use("/api/user-lessons", userLessonRoutes);
app.use("/api/user-tests", userTestRoutes);
app.use("/api/grammars", grammarRoutes);
app.use("/api/vocabularies", vocabularyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/statistics", statisticRoutes);
app.use("/api/configs", configRoutes);

app.use(ErrorLogMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodeEnum.OK_200).send("Keep api alive");
});

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
