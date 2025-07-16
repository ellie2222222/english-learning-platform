import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import PaymentController from "../controllers/PaymentController";
import PaymentDto from "../dtos/PaymentDto";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const paymentRoutes = Router();
const paymentController = Container.get(PaymentController);
const paymentDto = new PaymentDto();

paymentRoutes.use(AuthMiddleware);

paymentRoutes.post(
  "/vnpay/create",
  RoleMiddleware([UserEnum.USER, UserEnum.ADMIN]),
  paymentDto.createVNPayPayment,
  paymentController.createVnpayPayment
);

paymentRoutes.post(
  "/paypal/create",
  RoleMiddleware([UserEnum.USER, UserEnum.ADMIN]),
  paymentDto.createPaypalPayment,
  paymentController.createPaypalPayment
);

paymentRoutes.get("/vnpay/callback", paymentController.vnpayPaymentReturn);
paymentRoutes.get("/paypal/success", paymentController.successPaypalPayment);
paymentRoutes.get("/paypal/failed", paymentController.canceledPaypalPayment);

export default paymentRoutes;
