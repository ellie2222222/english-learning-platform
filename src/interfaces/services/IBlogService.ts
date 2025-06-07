import { IBlog } from "../models/IBlog";
import { IPagination } from "../others/IPagination";
import { IQuery } from "../others/IQuery";

export interface IBlogService {
  createBlog: (
    title: string,
    userId: string,
    content: string,
    attachments: string[] | null,
    coverImage: string | null,
    status?: string
  ) => Promise<IBlog | null>;

  updateBlog: (
    id: string,
    userId: string,
    title?: string,
    coverImage?: string | null,
    status?: string
  ) => Promise<IBlog | null>;

  deleteBlog: (id: string) => Promise<IBlog | null>;

  getBlog: (id: string, userId?: string) => Promise<IBlog | null>;

  getBlogs: (query: IQuery, userId?: string) => Promise<IPagination>;
}
