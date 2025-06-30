import { Router } from "express";
import Container from "typedi";
import ConfigController from "../controllers/ConfigController";
import ConfigDto from "../dtos/ConfigDto";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const configRoutes = Router();
const configController = Container.get(ConfigController);
const configDto = new ConfigDto();

configRoutes.use(AuthMiddleware);
configRoutes.use(RoleMiddleware([UserEnum.ADMIN]));

configRoutes.get("/:id", configDto.getConfig, configController.getConfig);
configRoutes.get("/", configDto.getConfigs, configController.getConfigs);
configRoutes.post("/", configDto.createConfig, configController.createConfig);
configRoutes.patch(
  "/:id",
  configDto.updateConfig,
  configController.updateConfig
);

export default configRoutes;
