import { IMembership } from "../models/IMembership";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";
import { MembershipTierEnum } from "../../enums/MembershipTierEnum";

export interface IMembershipService {
  createMembership: (
    name: string,
    description: string,
    duration: number,
    price: number,
    tier?: MembershipTierEnum
  ) => Promise<IMembership | null>;

  updateMembership: (
    id: string,
    name: string,
    description: string,
    duration: number,
    price: number,
    tier: MembershipTierEnum
  ) => Promise<IMembership | null>;

  deleteMembership: (id: string) => Promise<IMembership | null>;

  getMembership: (id: string) => Promise<IMembership | null>;

  getMemberships: (query: IQuery) => Promise<IPagination>;

  getMembershipTiers: () => Promise<any>;
}
