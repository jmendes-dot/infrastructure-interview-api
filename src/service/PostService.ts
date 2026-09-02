import { In, type DataSource, type Repository } from "typeorm";
import { Category } from "../entity/Category.js";
import { Post } from "../entity/Post.js";

export type CreatePostInput = {
  title: string;
  text: string;
  categories: Array<{ name: string }>;
};

export interface PostServiceContract {
  list(limit: number, offset: number): Promise<Post[]>;
  findById(id: number): Promise<Post | null>;
  create(input: CreatePostInput): Promise<Post>;
}

export class PostService implements PostServiceContract {
  private readonly posts: Repository<Post>;
  private readonly categories: Repository<Category>;

  constructor(database: DataSource) {
    this.posts = database.getRepository(Post);
    this.categories = database.getRepository(Category);
  }

  async list(limit: number, offset: number): Promise<Post[]> {
    return this.posts.find({
      relations: { categories: true },
      order: { id: "DESC" },
      take: limit,
      skip: offset,
    });
  }

  async findById(id: number): Promise<Post | null> {
    return this.posts.findOne({ where: { id }, relations: { categories: true } });
  }

  async create(input: CreatePostInput): Promise<Post> {
    const uniqueNames = [...new Set(input.categories.map(({ name }) => name.trim().toLowerCase()))];
    let categories: Category[] = [];

    if (uniqueNames.length > 0) {
      await this.categories.upsert(uniqueNames.map((name) => ({ name })), ["name"]);
      categories = await this.categories.findBy({ name: In(uniqueNames) });
    }

    return this.posts.save(this.posts.create({ ...input, categories }));
  }
}
