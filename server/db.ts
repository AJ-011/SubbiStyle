import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const shouldUseSSL = !/localhost|127\.0\.0\.1|::1/i.test(
  process.env.DATABASE_URL,
);

const connectionDescriptor = (() => {
  try {
    const url = new URL(process.env.DATABASE_URL!);
    return `${url.host}${url.pathname}`;
  } catch {
    return "unparseable";
  }
})();
console.log(
  `[startup][db] Initializing Postgres pool (target=${connectionDescriptor}, ssl=${shouldUseSSL})`,
);

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
