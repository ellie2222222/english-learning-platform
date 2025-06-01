import mongoose from "mongoose";
import { IMembership } from "../models/IMembership";
import { IQuery } from "../others/IQuery";

export interface IMembershipRepository {
  createMembership(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IMembership | null>;

  updateMembership(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IMembership | null>;

  deleteMembership(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IMembership | null>;

  getMembership(id: string): Promise<IMembership | null>;

  getMemberships(query: IQuery): Promise<IMembership[] | []>;

  getExistingMembership(name: string, id?: string): Promise<IMembership | null>;
}
