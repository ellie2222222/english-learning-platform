import { IBlog } from "../models/IBlog";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IBlogService {
  createBlog: (
    title: string,
    userId: string,
    content: string,
    coverImage: string
  ) => Promise<IBlog | null>;

  updateBlog: (
    id: string,
    title: string,
    userId: string,
    content: string,
    coverImage: string,
    status: string
  ) => Promise<IBlog | null>;

  deleteBlog: (id: number) => Promise<IBlog | null>;

  getBlog: (id: number) => Promise<IBlog | null>;

  getBlogs: (query: IQuery) => Promise<IPagination>;
}
