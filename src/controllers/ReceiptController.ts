import { Inject, Service } from "typedi";
import ReceiptService from "../services/ReceiptService";
import { IReceiptService } from "../interfaces/services/IReceiptService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

@Service()
class ReceiptController {
  constructor(
    @Inject(() => ReceiptService) private receiptService: IReceiptService
  ) {}

  createReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        amount,
        userId,
        membershipId,
        transactionId,
        paymentGateway,
        paymentMethod,
      } = req.body;

      const receipt = await this.receiptService.createReceipt(
        amount,
        userId,
        membershipId,
        transactionId,
        paymentMethod,
        paymentGateway
      );

      res
        .status(StatusCodeEnum.Created_201)
        .json({ receipt: receipt, message: "Receipt created successfully" });
    } catch (error) {
      next(error);
    }
  };

  getReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.userInfo.userId;
      const { id } = req.params;
      const receipt = await this.receiptService.getReceipt(id, requesterId);

      res.status(StatusCodeEnum.OK_200).json({
        receipt: receipt,
        message: "Receipt retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getReceipts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, order, sortBy, search } = req.query;
      const requesterId = req.userInfo.userId;
      const { id } = req.params;
      const receipts = await this.receiptService.getReceipts(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 5,
          order: (order as OrderType) || "asc",
          sortBy: (sortBy as SortByType) || "date",
          search: (search as string) || "",
        },
        id,
        requesterId
      );

      res.status(StatusCodeEnum.OK_200).json({
        ...receipts,
        message: "Receipts retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ReceiptController;
