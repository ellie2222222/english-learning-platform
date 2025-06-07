import { NextFunction, Request, Response } from "express";
import {
  formatPathArray,
  formatPathSingle,
  uploadToCloudinary,
  uploadToCloudinaryArray,
} from "../utils/fileUtils";
import { Inject, Service } from "typedi";
import BlogService from "../services/BlogService";
import { IBlogService } from "../interfaces/services/IBlogService";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
import dotenv from "dotenv";
dotenv.config();

@Service()
class BlogController {
  constructor(@Inject(() => BlogService) private blogService: IBlogService) {}

  createBlog = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [key: string]: Express.Multer.File[] };
    let attachments: string[] | null = null;
    let coverImage: string | null = null;

    try {
      const { title, content, status } = req.body;
      const userId = req.userInfo.userId;

      if (process.env.STORAGE_TYPE === "cloudinary") {
        if (files && files.blogCover && files.blogCover.length > 0) {
          coverImage = await uploadToCloudinary(files.blogCover[0]);
        }
        if (
          files &&
          files.blogAttachments &&
          files.blogAttachments.length > 0
        ) {
          attachments = await uploadToCloudinaryArray(files.blogAttachments);
        }
      } else {
        if (
          (files && files.blogCover && files.blogCover.length > 0) as boolean
        ) {
          coverImage = formatPathSingle(files.blogCover[0]);
        }
        if (
          files &&
          files.blogAttachments &&
          files.blogAttachments.length > 0
        ) {
          attachments = formatPathArray(
            files.blogAttachments as Express.Multer.File[]
          ) as string[];
        }
      }

      const blog = await this.blogService.createBlog(
        title,
        userId,
        content,
        attachments,
        coverImage,
        status
      );

      res.status(StatusCodeEnum.Created_201).json({
        blog: blog,
        message: "Blog created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateBlog = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [key: string]: Express.Multer.File[] };

    let coverImage: string | null = null;
    try {
      const { id } = req.params;
      const { title, status } = req.body;
      const userId = req.userInfo.userId;

      if (process.env.STORAGE_TYPE === "cloudinary") {
        if (files && files.blogCover && files.blogCover.length > 0) {
          coverImage = await uploadToCloudinary(files.blogCover[0]);
        }
      } else {
        if (
          (files && files.blogCover && files.blogCover.length > 0) as boolean
        ) {
          coverImage = formatPathSingle(files.blogCover[0]);
        }
      }

      const blog = await this.blogService.updateBlog(
        id,
        userId,
        title,
        coverImage,
        status
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ blog: blog, message: "Blog updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const blog = await this.blogService.deleteBlog(id);

      res
        .status(StatusCodeEnum.OK_200)
        .json({ blog: blog, message: "Blog deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  getBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const blog = await this.blogService.getBlog(id);

      res
        .status(StatusCodeEnum.OK_200)
        .json({ blog: blog, message: "Get blog successfully" });
    } catch (error) {
      next(error);
    }
  };

  getBlogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, order, sortBy, search } = req.query;

      const blogs = await this.blogService.getBlogs({
        page: parseInt(page as string) || 1,
        size: parseInt(size as string) || 5,
        order: (order as OrderType) || "asc",
        sortBy: (sortBy as SortByType) || "date",
        search: (search as string) || "",
      });

      res
        .status(StatusCodeEnum.OK_200)
        .json({ ...blogs, message: "Get blogs successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default BlogController;
