import { IMembership } from "../models/IMembership";
import { IQuery } from "../others/IQuery";

export interface IMembershipService {
  createMembership(
    name: string,
    description: string,
    duration: number,
    price: number
  ): Promise<IMembership | null>;
  updateMembership(
    id: string,
    name: string,
    description: string,
    duration: number,
    price: number
  ): Promise<IMembership | null>;
  deleteMembership(id: string): Promise<IMembership | null>;
  getMembership(id: string): Promise<IMembership | null>;
  getMemberships(query: IQuery): Promise<IMembership[] | []>;
}
