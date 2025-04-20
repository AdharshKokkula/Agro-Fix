import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Function to apply database migrations/ensure tables exist
export async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    
    // Add any database setup or migration logic here

    console.log("Database initialization successful!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}