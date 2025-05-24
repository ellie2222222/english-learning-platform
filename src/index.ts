import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import getLogger from './utils/logger';
import { swaggerDoc } from './configs/swaggerConfig';
import http from 'http'; 

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
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