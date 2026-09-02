import "reflect-metadata";
import { DataSource } from "typeorm";
import type { Config } from "./config.js";
import { Category } from "./entity/Category.js";
import { Post } from "./entity/Post.js";
import { InitialSchema1700000000000 } from "./migration/1700000000000-InitialSchema.js";

export function createDatabase(config: Config["database"]): DataSource {
  return new DataSource({
    type: "mysql",
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.password,
    database: config.name,
    charset: "utf8mb4_unicode_ci",
    timezone: "Z",
    ssl: config.ssl ? { rejectUnauthorized: true } : undefined,
    entities: [Post, Category],
    migrations: [InitialSchema1700000000000],
    migrationsRun: false,
    synchronize: false,
    logging: false,
    extra: {
      connectionLimit: config.poolSize,
      connectTimeout: config.connectTimeoutMs,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    },
  });
}
