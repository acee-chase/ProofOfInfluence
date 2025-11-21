import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Ensure the database is provisioned.");
}

// For Neon Serverless, we may need to use a direct connection string
// If the connection is terminated, try using a pooled connection URL
const dbUrl = process.env.DATABASE_URL;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  // Add connection timeout and retry settings
  verbose: true,
  strict: true,
});
