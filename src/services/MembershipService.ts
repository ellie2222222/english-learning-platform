import { Inject, Service } from "typedi";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IMembership } from "../interfaces/models/IMembership";
import { IMembershipService } from "../interfaces/services/IMembershipService";
import MembershipRepository from "../repositories/MembershipRepository";
import { IMembershipRepository } from "../interfaces/repositories/IMembershipRepository";
import Database from "../db/database";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";

@Service()
class MembershipService implements IMembershipService {
  constructor(
    @Inject(() => MembershipRepository)
    private membershipRepository: IMembershipRepository,
    @Inject() private database: Database
  ) {}

  createMembership = async (
    name: string,
    description: string,
    duration: number,
    price: number
  ): Promise<IMembership | null> => {
    const session = await this.database.startTransaction();
    try {
      const existingMembership =
        await this.membershipRepository.getExistingMembership(name);

      if (existingMembership) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Membership already exists"
        );
      }

      const membership = await this.membershipRepository.createMembership(
        {
          name,
          description,
          duration,
          price,
        },
        session
      );

      await this.database.commitTransaction(session);

      return membership;
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

  updateMembership = async (
    id: string,
    name: string,
    description: string,
    duration: number,
    price: number
  ): Promise<IMembership | null> => {
    const session = await this.database.startTransaction();
    try {
      const currentMembership = await this.membershipRepository.getMembership(
        id
      );

      if (!currentMembership) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership not found"
        );
      }

      const checkName = name ? name : currentMembership.name;

      const checkMembership =
        await this.membershipRepository.getExistingMembership(checkName, id);

      if (checkMembership) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "Membership already exists"
        );
      }

      const updatedMembership =
        await this.membershipRepository.updateMembership(
          id,
          {
            name,
            description,
            duration,
            price,
          },
          session
        );

      await this.database.commitTransaction(session);

      return updatedMembership;
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

  deleteMembership = async (id: string): Promise<IMembership | null> => {
    const session = await this.database.startTransaction();
    try {
      const membership = await this.membershipRepository.deleteMembership(
        id,
        session
      );

      await this.database.commitTransaction(session);

      return membership;
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

  getMembership = async (id: string): Promise<IMembership | null> => {
    try {
      const membership = this.membershipRepository.getMembership(id);

      return membership;
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
  getMemberships = async (query: IQuery): Promise<IPagination> => {
    try {
      const memberships = await this.membershipRepository.getMemberships(query);

      return memberships;
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
export default MembershipService;
