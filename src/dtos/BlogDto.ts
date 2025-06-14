import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { JSDOM } from "jsdom";
import { BlogStatusEnum } from "../enums/BlogStatusEnum";
import { formatPathArray } from "../utils/fileUtils";
import mongoose from "mongoose";
import { AchievementTypeEnum } from "../enums/AchievementTypeEnum";
import { OrderType, SortByType } from "../interfaces/others/IQuery";
class BlogDto {
  createBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [key: string]: Express.Multer.File[] };
      const { title, content, status } = req.body;
      let attachments: string[] | null = null;
      let coverImage: string | null = null;
      if ((files && files.blogCover && files.blogCover.length > 0) as boolean) {
        coverImage = files.blogCover[0].path;
      }
      if (files && files.blogAttachments && files.blogAttachments.length > 0) {
        attachments = formatPathArray(
          files.blogAttachments as Express.Multer.File[]
        ) as string[];
      }

      if (!title || !content) {
        throw new Error("Missing required fields");
      }

      if (!coverImage) {
        throw new Error("Cover Image is required");
      }

      const sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
          img: ["src", "alt", "width", "height", "style", "class"],
          "*": ["style", "class"],
        },
      });

      const dom = new JSDOM(sanitizedContent);

      if (status && !Object.values(BlogStatusEnum).includes(status)) {
        throw new Error("Invalid blog status");
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  updateBlog = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const { id } = req.params;
    const { title, status } = req.body;

    let coverImage: string | null = null;
    try {
      if (!id) {
        throw new Error("Blog id is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid blog id");
      }

      if (status && !Object.values(BlogStatusEnum).includes(status)) {
        throw new Error("Invalid blog status");
      }

      if (files?.blogCover?.length > 0) {
        coverImage = files.blogCover[0].path;
      }

      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Blog id is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid blog id");
      }
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  getBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Blog id is required");
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid blog id");
      }
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };

  getBlogs = async (req: Request, res: Response, next: NextFunction) => {
    const { page, size, order, sortBy, search, type } = req.query;
    try {
      if (page && parseInt(page as string) < 1) {
        throw new Error("Invalid page number");
      }
      if (size && parseInt(size as string) < 1) {
        throw new Error("Invalid size");
      }
      if (order && !Object.values(OrderType).includes(order as OrderType)) {
        throw new Error("Invalid order");
      }
      if (sortBy && !Object.values(SortByType).includes(sortBy as SortByType)) {
        throw new Error("Invalid sort by");
      }

      if (
        type &&
        !Object.values(AchievementTypeEnum).includes(type as string)
      ) {
        throw new Error("Invalid type");
      }
      next();
    } catch (error) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  };
}

export default BlogDto;
