import { Inject, Service } from "typedi";
import { IReceiptService } from "../interfaces/services/IReceiptService";
import { IReceipt } from "../interfaces/models/IReceipt";
import Database from "../db/database";
import ReceiptRepository from "../repositories/ReceiptRepository";
import { IReceiptRepository } from "../interfaces/repositories/IReceiptRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import UserRepository from "../repositories/UserRepository";
import { ObjectId } from "mongoose";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/others/IQuery";
import MembershipRepository from "../repositories/MembershipRepository";
import { IMembershipRepository } from "../interfaces/repositories/IMembershipRepository";

@Service()
class ReceiptService implements IReceiptService {
  constructor(
    @Inject(() => UserRepository) private userRepository: IUserRepository,
    @Inject(() => MembershipRepository)
    private membershipRepository: IMembershipRepository,
    @Inject() private database: Database,
    @Inject(() => ReceiptRepository)
    private receiptRepository: IReceiptRepository
  ) {}
  createReceipt = async (
    amount: number,
    userId: string,
    membershipId: string,
    paymentMethod: string,
    paymentGateway: string
  ): Promise<IReceipt | null> => {
    const session = await this.database.startTransaction();
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

      const receipt = await this.receiptRepository.createReceipt(
        { amount, userId, membershipId, paymentMethod, paymentGateway },
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
    }
  };
  getReceipt = async (
    id: string,
    requesterId: string
  ): Promise<IReceipt | null> => {
    try {
      const requester = await this.userRepository.getUserById(
        requesterId,
        false
      );
      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const receipt = await this.receiptRepository.getReceipt(id);
      if (!receipt) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Receipt not found"
        );
      }

      const isOwner =
        (requester._id as ObjectId).toString() ===
        (receipt.userId as ObjectId).toString();
      const isAdmin = requester.role === UserEnum.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }

      return receipt;
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
  getReceipts = async (
    query: IQuery,
    userId: string,
    requesterId: string
  ): Promise<IReceipt[] | null> => {
    try {
      const requester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const isOwner = (requester._id as ObjectId).toString() === userId;
      const isAdmin = requester.role === UserEnum.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }

      const receipts = await this.receiptRepository.getReceipts(query, userId);

      return receipts;
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

export default ReceiptService;
