import { Router } from "express";
import Container from "typedi";
import MembershipController from "../controllers/MembershipController";
import MembershipDto from "../dtos/MembershipDto";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const membershipController = Container.get(MembershipController);
const membershipDto = new MembershipDto();
const membershipRoutes = Router();

membershipRoutes.use(AuthMiddleware);

membershipRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  membershipDto.createMembership,
  membershipController.createMembership
);

membershipRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  membershipDto.updateMembership,
  membershipController.updateMembership
);

membershipRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  membershipDto.deleteMembership,
  membershipController.deleteMembership
);

membershipRoutes.get(
  "/",
  membershipDto.getMemberships,
  membershipController.getMemberships
);

membershipRoutes.get(
  "/:id",
  membershipDto.getMembership,
  membershipController.getMembership
);

export default membershipRoutes;
