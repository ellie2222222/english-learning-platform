import { Router } from "express";
import Container from "typedi";
import ReceiptController from "../controllers/ReceiptController";
import ReceiptDto from "../dtos/ReceiptDto";
import AuthMiddleware from "../middlewares/AuthMiddleware";

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
  receiptDto.getReceipts,
  receiptController.getReceipts
);

receiptRoutes.get("/:id", receiptDto.getReceipt, receiptController.getReceipt);

export default receiptRoutes;
