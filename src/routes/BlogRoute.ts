import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import Container from "typedi";
import BlogController from "../controllers/BlogController";
import BlogDto from "../dtos/BlogDto";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { uploadFile } from "../middlewares/storeFile";

const blogRoutes = Router();
const blogController = Container.get(BlogController);
const blogDto = new BlogDto();
blogRoutes.use(AuthMiddleware);

blogRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  uploadFile.fields([
    { name: "blogCover", maxCount: 1 },
    { name: "blogAttachments", maxCount: 10 },
  ]),
  blogDto.createBlog,
  blogController.createBlog
);

blogRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  uploadFile.fields([{ name: "blogCover", maxCount: 1 }]),
  blogDto.updateBlog,
  blogController.updateBlog
);

blogRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  blogDto.deleteBlog,
  blogController.deleteBlog
);

blogRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER, UserEnum.GUEST]),
  blogDto.getBlogs,
  blogController.getBlogs
);

blogRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.USER, UserEnum.GUEST]),
  blogDto.getBlog,
  blogController.getBlog
);

export default blogRoutes;
