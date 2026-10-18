import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzleNeon<typeof schema>>;

let dbInstance: Database | null = null;

function isLocalDatabase(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function createDb(url: string): Database {
  // Local Postgres (development/testing) uses node-postgres; everything else uses Neon over HTTP.
  // The query-builder API used by the app is the same for both drivers.
  if (isLocalDatabase(url)) {
    return drizzlePg(new Pool({ connectionString: url }), { schema }) as unknown as Database;
  }
  return drizzleNeon(neon(url), { schema });
}

// Returns the database or throws a clear error when DATABASE_URL is missing.
// The app never falls back to mock data.
export function getDb(): Database {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not configured");
    }
    dbInstance = createDb(url);
  }
  return dbInstance;
}

export { schema };
