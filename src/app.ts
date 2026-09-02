import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import helmet from "helmet";
import type { Logger } from "pino";
import pinoHttp from "pino-http";
import { z } from "zod";
import type { PostServiceContract } from "./service/PostService.js";

const idSchema = z.coerce.number().int().positive();
const pageSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});
const postSchema = z.object({
  title: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(50_000),
  categories: z.array(z.object({ name: z.string().trim().min(1).max(120) })).max(20).default([]),
}).strict();

export type AppDependencies = {
  posts: PostServiceContract;
  isDatabaseReady: () => Promise<boolean>;
  logger: Logger;
};

export function createApp({ posts, isDatabaseReady, logger }: AppDependencies): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(pinoHttp({
    logger,
    autoLogging: {
      ignore: (request) => request.url?.startsWith("/health/") ?? false,
    },
  }));
  app.use(helmet());
  app.use(express.json({ limit: "64kb", strict: true }));

  app.get("/health/live", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.get("/health/ready", async (_request, response) => {
    const ready = await isDatabaseReady().catch(() => false);
    response.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready" });
  });

  app.get("/posts", (async (request, response) => {
    const page = pageSchema.safeParse(request.query);
    if (!page.success) {
      response.status(400).json({ error: "invalid_pagination" });
      return;
    }
    response.json(await posts.list(page.data.limit, page.data.offset));
  }) satisfies RequestHandler);

  app.get("/posts/:id", (async (request, response) => {
    const id = idSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ error: "invalid_id" });
      return;
    }
    const post = await posts.findById(id.data);
    if (!post) {
      response.status(404).json({ error: "post_not_found" });
      return;
    }
    response.json(post);
  }) satisfies RequestHandler);

  app.post("/posts", (async (request, response) => {
    const input = postSchema.safeParse(request.body);
    if (!input.success) {
      response.status(400).json({ error: "invalid_request", details: input.error.flatten().fieldErrors });
      return;
    }
    response.status(201).json(await posts.create(input.data));
  }) satisfies RequestHandler);

  app.use((_request, response) => {
    response.status(404).json({ error: "not_found" });
  });

  const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
    void _next;
    request.log.error({ err: error }, "request failed");
    response.status(500).json({ error: "internal_server_error" });
  };
  app.use(errorHandler);

  return app;
}
