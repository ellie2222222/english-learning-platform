import querystring from "qs";
import crypto from "crypto";
import { Inject, Service } from "typedi";
import { IPaymentService } from "../interfaces/services/IPaymentService";
import CustomException from "../exceptions/CustomException";
import { client } from "../configs/paypalConfig";
import paypal from "@paypal/checkout-server-sdk";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import MembershipRepository from "../repositories/MembershipRepository";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IMembershipRepository } from "../interfaces/repositories/IMembershipRepository";
import { PaypalPayment, sortObject, VnpayPayment } from "../utils/payment";
import { IUser } from "../interfaces/models/IUser";
import Database from "../db/database";
import ReceiptRepository from "../repositories/ReceiptRepository";
import { IReceiptRepository } from "../interfaces/repositories/IReceiptRepository";
import { IReceipt } from "../interfaces/models/IReceipt";
import { IPaymentData } from "../interfaces/others/IPaymentData";
import { IVNPayParams } from "../interfaces/others/IVNPayParams";
import { vnpayConfig } from "../configs/vnpayConfig";

@Service()
class PaymentService implements IPaymentService {
  constructor(
    @Inject() private database: Database,
    @Inject(() => MembershipRepository)
    private membershipRepository: IMembershipRepository,
    @Inject(() => UserRepository) private userRepository: IUserRepository,
    @Inject(() => ReceiptRepository)
    private receiptRepository: IReceiptRepository
  ) {}

  createPaypalPayment = async (
    membershipId: string,
    userId: string,
    platform: string
  ): Promise<string> => {
    try {
      const checkUser = await this.userRepository.getUserById(userId, false);
      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const checkMembership = await this.membershipRepository.getMembership(
        membershipId
      );
      if (!checkMembership) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership not found"
        );
      }

      const url = await PaypalPayment(
        +(checkMembership.price / 25000).toFixed(2),
        userId,
        membershipId,
        platform
      );
      return url;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  createVNPayPayment = async (
    membershipId: string,
    userId: string,
    platform: string,
    ipAddr?: string,
    bankCode?: string
  ): Promise<string> => {
    try {
      const checkUser = await this.userRepository.getUserById(userId, false);
      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const checkMembership = await this.membershipRepository.getMembership(
        membershipId
      );
      if (!checkMembership) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership not found"
        );
      }

      const url = await VnpayPayment(
        checkMembership.price,
        userId,
        membershipId,
        platform,
        ipAddr,
        bankCode
      );

      return url;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  handleSuccessPayment = async (
    userId: string,
    membershipId: string,
    transactionId: string,
    totalAmount: number,
    paymentMethod: string,
    paymentGateway: string
  ): Promise<IReceipt | null> => {
    const session = await this.database.startTransaction();
    try {
      const checkUser = await this.userRepository.getUserById(userId);
      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const checkMembership = await this.membershipRepository.getMembership(
        membershipId
      );

      if (!membershipId) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership not found"
        );
      }

      let activeUntil = checkUser.activeUntil || null;
      if (activeUntil === null) {
        activeUntil = new Date(
          Date.now() +
            (checkMembership?.duration as number) * 24 * 60 * 60 * 1000
        );
      } else {
        activeUntil = new Date(
          new Date(checkUser?.activeUntil as Date).getTime() +
            (checkMembership?.duration as number) * 24 * 60 * 60 * 1000
        );
      }

      const updatedUser = await this.userRepository.updateUserById(
        userId,
        {
          activeUntil,
        },
        session
      );

      const receipt = await this.receiptRepository.createReceipt(
        {
          userId,
          membershipId,
          transactionId,
          amount: totalAmount,
          paymentGateway,
          paymentMethod,
        },
        session
      );

      await this.database.commitTransaction(session);
      return receipt;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  paypalSuccess = async (token: string): Promise<IPaymentData | null> => {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(token as string);
      const response = await client.execute(request);
      const { status, purchase_units } = response.result;

      if (status === "COMPLETED") {
        const capturedPaymentDetails =
          purchase_units?.[0].payments?.captures?.[0];
        const transactionId = capturedPaymentDetails?.id;

        const data = {
          userId: (capturedPaymentDetails?.custom_id as string).split("|")[0],
          membershipPackageId: (
            capturedPaymentDetails?.custom_id as string
          ).split("|")[1],
          platform: (capturedPaymentDetails?.custom_id as string).split("|")[2],
          totalAmount: {
            value: capturedPaymentDetails?.amount?.value,
            currency: capturedPaymentDetails?.amount?.currency_code,
          },
          transactionId,
          paymentMethod: "PAYPAL",
          paymentGateway: "PAYPAL",
          type: "PAYMENT",
        };
        return data;
      }
      return null;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  vnpaySuccess = async (
    vnp_Params: IVNPayParams
  ): Promise<IPaymentData | null> => {
    try {
      const secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      let formatedVNP_Params = sortObject(vnp_Params);

      const secretKey = vnpayConfig.vnp_HashSecret;
      const signData = querystring.stringify(formatedVNP_Params, {
        encode: false,
      });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      if (secureHash === signed && vnp_Params["vnp_ResponseCode"] === "00") {
        const amount = parseFloat(vnp_Params.vnp_Amount as string) / 100;

        const [userId, membershipPackageId, platform = "WEB"] =
          decodeURIComponent(vnp_Params.vnp_OrderInfo as string).split("|");
        const data = {
          userId: userId,
          membershipPackageId: membershipPackageId,
          platform: platform,
          totalAmount: {
            value: amount,
            currency: vnp_Params.vnp_CurrCode || "VND",
          },
          transactionId: vnp_Params.vnp_TxnRef,
          paymentMethod: vnp_Params.vnp_CardType as string,
          paymentGateway: "VNPAY",
          type: "PAYMENT",
          bankCode: vnp_Params.vnp_BankCode,
        };

        return data;
      }
      return null;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };
}

export default PaymentService;
