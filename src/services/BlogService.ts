import { IBlog } from "../interfaces/models/IBlog";
import { IBlogService } from "../interfaces/services/IBlogService";

class BlogService implements IBlogService {
  createBlog(
    title: string,
    userId: string,
    content: string,
    coverImage: string
  ): Promise<IBlog | null> {}
  getBlog(id: number): Promise<IBlog | null> {}
  getBlogs(query: IQuery): Promise<IPagination> {}
  updateBlog(
    id: string,
    title: string,
    userId: string,
    content: string,
    coverImage: string,
    status: string
  ): Promise<IBlog | null> {}
  deleteBlog(id: number): Promise<IBlog | null> {}
}

export default BlogService;
