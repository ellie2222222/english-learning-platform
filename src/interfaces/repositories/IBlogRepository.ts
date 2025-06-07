import mongoose from "mongoose";
import { IBlog } from "../models/IBlog";
import { IQuery } from "../others/IQuery";
import { IPagination } from "../others/IPagination";

export interface IBlogRepository {
  createBlog(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IBlog | null>;

  updateBlog(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IBlog | null>;

  deleteBlog(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IBlog | null>;

  getBlog(id: string): Promise<IBlog | null>;

  getBlogs(query: IQuery): Promise<IPagination>;

  getBlogByTitle(title: string, id?: string): Promise<IBlog | null>;
}
