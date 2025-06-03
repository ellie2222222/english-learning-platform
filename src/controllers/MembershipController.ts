import { Inject, Service } from "typedi";
import MembershipService from "../services/MembershipService";
import { IMembershipService } from "../interfaces/services/IMembershipService";
import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";

@Service()
class MembershipController {
  constructor(
    @Inject(() => MembershipService)
    private membershipService: IMembershipService
  ) {}

  createMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, description, price, duration } = req.body;
      const membership = await this.membershipService.createMembership(
        name,
        description,
        duration,
        price
      );

      res.status(StatusCodeEnum.Created_201).json({
        membership: membership,
        message: "Membership created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { name, description, duration, price } = req.body;
      const membership = await this.membershipService.updateMembership(
        id,
        name,
        description,
        duration,
        price
      );

      res.status(StatusCodeEnum.OK_200).json({
        membership: membership,
        message: "Membership updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const membership = await this.membershipService.deleteMembership(id);
      res.status(StatusCodeEnum.OK_200).json({
        membership: membership,
        message: "Membership deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getMembership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const membership = await this.membershipService.getMembership(id);
      res.status(StatusCodeEnum.OK_200).json({
        membership: membership,
        message: "Membership retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, order, sortBy, search } = req.query;
      const memberships = await this.membershipService.getMemberships({
        page: parseInt(page as string) || 1,
        size: parseInt(size as string) || 5,
        order: (order as OrderType) || "asc",
        sortBy: (sortBy as SortByType) || "date",
        search: (search as string) || "",
      });

      res.status(StatusCodeEnum.OK_200).json({
        ...memberships,
        message: "Memberships retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
export default MembershipController;
