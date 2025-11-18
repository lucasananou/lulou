import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL is not set. Database-dependent features are disabled."
  );
}

const client = connectionString ? postgres(connectionString) : null;
export const db = client ? drizzle(client, { schema }) : null;
export const isDatabaseConfigured = Boolean(connectionString);

export function getDb() {
  if (!db) {
    throw new Error("DATABASE_URL is not set. Configure it to enable the database.");
  }
  return db;
}

