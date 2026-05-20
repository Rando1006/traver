import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let database: Database | undefined;

export function getDb() {
  if (database) {
    return database;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL must be set to connect to Neon Postgres.");
  }

  const sql = neon(connectionString);
  database = drizzle(sql, { schema });

  return database;
}
