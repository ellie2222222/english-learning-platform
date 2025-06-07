import { Inject, Service } from "typedi";
import Database from "../db/database";
import { IBlog } from "../interfaces/models/IBlog";
import { IBlogService } from "../interfaces/services/IBlogService";
import BlogRepository from "../repositories/BlogRepository";
import { IBlogRepository } from "../interfaces/repositories/IBlogRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/others/IQuery";
import { IPagination } from "../interfaces/others/IPagination";
import {
  cleanUpFile,
  cleanUpFileArray,
  extractAndReplaceImages,
  extractImageUrlsFromContent,
  decodedHtml,
} from "../utils/fileUtils";
import { decode } from "punycode";

@Service()
class BlogService implements IBlogService {
  constructor(
    @Inject() private database: Database,
    @Inject(() => BlogRepository) private blogRepository: IBlogRepository
  ) {}
  async createBlog(
    title: string,
    userId: string,
    content: string,
    attachments: string[] | null,
    coverImage: string | null,
    status?: string
  ): Promise<IBlog | null> {
    const session = await this.database.startTransaction();
    try {
      const checkBlog = await this.blogRepository.getBlogByTitle(title);
      if (checkBlog) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Blog with this title already exists"
        );
      }

      const formatedContent = extractAndReplaceImages(
        content,
        attachments || [],
        []
      );

      const blog = await this.blogRepository.createBlog(
        {
          title,
          userId,
          content: formatedContent,
          coverImage,
          status,
        },
        session
      );

      await this.database.commitTransaction(session);

      return blog;
    } catch (error) {
      if (attachments && attachments.length > 0) {
        cleanUpFileArray(attachments, "create");
      }
      if (coverImage) {
        cleanUpFile(coverImage, "create");
      }
      //clean up uploaded files
      await this.database.abortTransaction(session);

      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  updateBlog = async (
    id: string,
    userId: string,
    title?: string,
    coverImage?: string | null,
    status?: string
  ): Promise<IBlog | null> => {
    const session = await this.database.startTransaction();
    type blogData = {
      title?: string;
      coverImage?: string;
      status?: string;
    };
    try {
      const checkBlog = await this.blogRepository.getBlog(id);
      if (!checkBlog) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Blog not found"
        );
      }

      const updateData: blogData = {};
      if (title) {
        updateData.title = title;
      }

      if (coverImage) {
        updateData.coverImage = coverImage;
      }

      if (status) {
        updateData.status = status;
      }
      const blog = await this.blogRepository.updateBlog(
        id,
        updateData,
        session
      );
      if (!blog) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Blog not found"
        );
      }
      await this.database.commitTransaction(session);
      if (coverImage && checkBlog.coverImage) {
        cleanUpFile(checkBlog.coverImage, "update");
      }
      return blog;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  async getBlog(id: string): Promise<IBlog | null> {
    try {
      const blog = await this.blogRepository.getBlog(id);

      return blog;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }
  async getBlogs(query: IQuery): Promise<IPagination> {
    try {
      const blogs = await this.blogRepository.getBlogs(query);

      return blogs;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }

  async deleteBlog(id: string): Promise<IBlog | null> {
    const session = await this.database.startTransaction();
    try {
      const blog = await this.blogRepository.deleteBlog(id, session);

      const urls = extractImageUrlsFromContent(blog?.content as string);

      await this.database.commitTransaction(session);
      if (blog?.coverImage) {
        cleanUpFile(blog.coverImage, "update");
      }
      if (urls.length > 0) {
        cleanUpFileArray(urls, "update");
      }

      return blog;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }
}

export default BlogService;
