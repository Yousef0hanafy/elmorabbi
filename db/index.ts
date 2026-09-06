import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql, { schema });
  } catch (err) {
    console.warn("Failed to connect to Neon database:", err);
  }
}

export const db = dbInstance;
export { schema };
