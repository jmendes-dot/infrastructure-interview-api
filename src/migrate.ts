import { loadConfig } from "./config.js";
import { createDatabase } from "./database.js";
import { createLogger } from "./logger.js";

const config = loadConfig();
const logger = createLogger(config.logLevel);
const database = createDatabase(config.database);

async function migrate(): Promise<void> {
  await database.initialize();
  const migrations = await database.runMigrations({ transaction: "all" });
  logger.info({ migrations: migrations.map(({ name }) => name) }, "database migrations completed");
  await database.destroy();
}

migrate().catch((error: unknown) => {
  logger.fatal({ err: error }, "database migration failed");
  process.exit(1);
});
