import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDatabase } from "./database.js";
import { createLogger } from "./logger.js";
import { PostService } from "./service/PostService.js";

const config = loadConfig();
const logger = createLogger(config.logLevel);
const database = createDatabase(config.database);

async function main(): Promise<void> {
  await database.initialize();

  const app = createApp({
    posts: new PostService(database),
    isDatabaseReady: async () => {
      await database.query("SELECT 1");
      return true;
    },
    logger,
  });

  const server = app.listen(config.port, "0.0.0.0", () => {
    logger.info({ port: config.port }, "server started");
  });
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  server.requestTimeout = 30_000;

  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "graceful shutdown started");

    const deadline = setTimeout(() => {
      logger.fatal("graceful shutdown timed out");
      process.exit(1);
    }, 25_000);
    deadline.unref();

    server.close(async (error) => {
      if (database.isInitialized) await database.destroy();
      clearTimeout(deadline);
      if (error) {
        logger.error({ err: error }, "server shutdown failed");
        process.exit(1);
      }
      logger.info("graceful shutdown completed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, "application failed to start");
  process.exit(1);
});
