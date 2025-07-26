import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import PaymentService from "../services/PaymentService";
import { IPaymentService } from "../interfaces/services/IPaymentService";
import PaymentQueue from "../queue/PaymentQueue";
import { IPaymentQueue } from "../interfaces/queue/IPaymentQueue";
import { IVNPayParams } from "../interfaces/others/IVNPayParams";
import { client } from "../configs/paypalConfig";
import paypal from "@paypal/checkout-server-sdk";
import { PlatformEnum } from "../enums/PlatformEnum";
@Service()
class PaymentController {
  constructor(
    @Inject(() => PaymentQueue) private paymentQueue: IPaymentQueue,
    @Inject(() => PaymentService) private paymentService: IPaymentService
  ) {}
  createPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { membershipId, platform } = req.body;
    const userId = req.userInfo.userId;

    try {
      const approvalLink = await this.paymentService.createPaypalPayment(
        membershipId,
        userId,
        platform
      );

      if (approvalLink) {
        res.status(StatusCodeEnum.OK_200).json({ link: approvalLink });
      } else {
        res
          .status(StatusCodeEnum.InternalServerError_500)
          .json({ message: "Approval link not found." });
      }
    } catch (error) {
      next(error);
    }
  };

  createVnpayPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { membershipId, bankCode, platform } = req.body;
    const userId = req.userInfo.userId;
    const ipAddr =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    try {
      const vnpUrl = await this.paymentService.createVNPayPayment(
        membershipId,
        userId,
        platform,
        ipAddr as string,
        bankCode
      );
      res.status(200).json({ link: vnpUrl });
    } catch (error) {
      next(error);
    }
  };

  successPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { token } = req.query;

    let platform = "web"; // default fallback

    try {
      // Fetch platform early
      const order = new paypal.orders.OrdersGetRequest(token as string);
      const response = await client.execute(order);
      const rawCustomId = response.result?.purchase_units?.[0]?.custom_id;
      platform = rawCustomId?.split("|")[2] ?? PlatformEnum.WEB;
    } catch {
      platform = PlatformEnum.WEB;
    }

    if (!token) {
      return res.render("PaymentReturn", {
        success: false,
        message: "Missing payment token.",
        frontendUrl:
          platform === PlatformEnum.WEB
            ? process.env.FRONTEND_URL
            : `${process.env.FRONTEND_URL}/for-mobile`,
      });
    }

    try {
      const data = await this.paymentService.paypalSuccess(token as string);

      if (!data) {
        return res.render("PaymentReturn", {
          success: false,
          message: "Failed to process payment.",
          frontendUrl: process.env.FRONTEND_URL,
        });
      }

      await this.paymentQueue.sendPaymentData(data);
      const receipt = await this.paymentQueue.consumePaymentData();

      // Render EJS page
      return res.render("PaymentReturn", {
        success: true,
        message: "Payment processed successfully.",
        frontendUrl:
          platform === PlatformEnum.WEB
            ? process.env.FRONTEND_URL
            : `${process.env.FRONTEND_URL}/for-mobile`,
        receipt,
      });
    } catch (error) {
      next(error);
    }
  };

  canceledPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    res.render("PaymentReturn", {
      success: false,
      message: "Your payment request was canceled.",
      frontendUrl: process.env.FRONTEND_URL,
    });
    return;
  };

  vnpayPaymentReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let vnp_Params = req.query;

    let platform = PlatformEnum.WEB;
    try {
      const rawOrderInfo = decodeURIComponent(
        req.query.vnp_OrderInfo as string
      );
      platform = rawOrderInfo.split("|")[2] || PlatformEnum.WEB;
    } catch {
      platform = PlatformEnum.WEB;
    }

    try {
      const data = await this.paymentService.vnpaySuccess(
        vnp_Params as unknown as IVNPayParams
      );

      if (!data) {
        return res.render("PaymentReturn", {
          success: false,
          message: "Payment failed or checksum validation failed.",
          frontendUrl:
            platform === PlatformEnum.WEB
              ? process.env.FRONTEND_URL
              : `${process.env.FRONTEND_URL}/for-mobile`,
        });
      }

      await this.paymentQueue.sendPaymentData(data);
      const receipt = await this.paymentQueue.consumePaymentData();

      return res.render("PaymentReturn", {
        success: true,
        message: "Payment processed successfully.",
        frontendUrl:
          platform === PlatformEnum.WEB
            ? process.env.FRONTEND_URL
            : `${process.env.FRONTEND_URL}/for-mobile`,
        receipt,
      });
    } catch (error) {
      return res.render("PaymentReturn", {
        success: false,
        message: "Failed to process payment.",
        frontendUrl:
          platform === PlatformEnum.WEB
            ? process.env.FRONTEND_URL
            : `${process.env.FRONTEND_URL}/for-mobile`,
      });
    }
  };
}
export default PaymentController;
