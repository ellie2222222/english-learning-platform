import { Application, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import getLogger from "../utils/logger";
import packageJson from "../../package.json";

const version = packageJson.version;

dotenv.config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "English Learning Platform API Docs",
      version,
      description: "Swagger",
      contact: {
        name: "Github",
        url: "https://github.com/ellie2222222/english-learning-platform",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Development server",
      },
    ],
    tags: [],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./routes/*.ts",
    "./interfaces/*.ts",
    "./enums/*.ts",
    "./swaggers/*.ts",
    "./**/*.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDoc(app: Application): void {
  const logger = getLogger("SWAGGER");

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        docExpansion: "none",
        filter: true,
        persistAuthorization: true,
      },
      explorer: true,
    })
  );

  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(
    `Swagger is running at: ${
      process.env.NODE_ENV === "PRODUCTION"
        ? process.env.PRODUCTION_URL
        : process.env.SERVER_URL
    }/api-docs`
  );
}
