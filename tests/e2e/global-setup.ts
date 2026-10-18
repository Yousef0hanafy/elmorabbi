import { execSync } from "node:child_process";

// Reset demo data so every run starts from the same state
export default function globalSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must point to a test database for e2e tests");
  }
  execSync("npx tsx db/seed.ts", { stdio: "inherit" });
}
