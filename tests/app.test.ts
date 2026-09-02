import pino from "pino";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import type { PostServiceContract } from "../src/service/PostService.js";

function buildApp(overrides: Partial<PostServiceContract> = {}, ready = true) {
  const posts: PostServiceContract = {
    list: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async (input) => ({ id: 1, ...input })),
    ...overrides,
  };
  return {
    app: createApp({ posts, isDatabaseReady: async () => ready, logger: pino({ enabled: false }) }),
    posts,
  };
}

describe("HTTP API", () => {
  it("reports liveness without querying dependencies", async () => {
    const { app } = buildApp();
    await request(app).get("/health/live").expect(200, { status: "ok" });
  });

  it("fails readiness when the database is unavailable", async () => {
    const { app } = buildApp({}, false);
    await request(app).get("/health/ready").expect(503, { status: "not_ready" });
  });

  it("bounds list pagination", async () => {
    const { app, posts } = buildApp();
    await request(app).get("/posts?limit=25&offset=10").expect(200, []);
    expect(posts.list).toHaveBeenCalledWith(25, 10);
    await request(app).get("/posts?limit=1000").expect(400);
  });

  it("returns 404 for a missing post", async () => {
    const { app } = buildApp();
    await request(app).get("/posts/42").expect(404, { error: "post_not_found" });
  });

  it("validates and creates a post", async () => {
    const { app, posts } = buildApp();
    const body = { title: "Production", text: "Ready", categories: [{ name: "DevOps" }] };
    await request(app).post("/posts").send(body).expect(201);
    expect(posts.create).toHaveBeenCalledWith(body);
    await request(app).post("/posts").send({ title: "", text: "" }).expect(400);
  });
});
