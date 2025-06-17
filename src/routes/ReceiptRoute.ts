import { Router } from "express";
import Container from "typedi";
import ReceiptController from "../controllers/ReceiptController";
import ReceiptDto from "../dtos/ReceiptDto";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const receiptRoutes = Router();
const receiptController = Container.get(ReceiptController);
const receiptDto = new ReceiptDto();

receiptRoutes.use(AuthMiddleware);

// //for testing
// receiptRoutes.post(
//   "/",
//   receiptDto.createReceipt,
//   receiptController.createReceipt
// );

receiptRoutes.get(
  "/:id/users",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER]),
  receiptDto.getReceipts,
  receiptController.getReceipts
);

receiptRoutes.get("/:id", receiptDto.getReceipt, receiptController.getReceipt);

export default receiptRoutes;
