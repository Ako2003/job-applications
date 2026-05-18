import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Configure Neon for serverless environments
// In Node.js environments, we need to use the ws package for WebSocket support
if (typeof globalThis.WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Create the Neon adapter with the connection string
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
