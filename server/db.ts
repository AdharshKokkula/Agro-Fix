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
    
    // Read and execute the SQL from our migration file
    const fs = await import('fs');
    const path = await import('path');
    
    try {
      // Read the schema SQL file
      const schemaPath = path.resolve('./drizzle/0000_initial_schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute the SQL to create tables
      await pool.query(schemaSql);
      console.log("Database tables created/updated successfully");
    } catch (err) {
      console.error("Error applying schema:", err);
      // Create tables directly if the file method fails
      await createTablesDirectly();
    }

    console.log("Database initialization successful!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Fallback function to create tables directly
async function createTablesDirectly() {
  try {
    console.log("Creating tables directly...");
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        email TEXT,
        full_name TEXT,
        phone TEXT,
        preferred_address TEXT,
        preferred_city TEXT,
        preferred_state TEXT,
        preferred_pincode TEXT,
        created_at TEXT
      );
    `);
    
    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER NOT NULL,
        min_order_quantity INTEGER NOT NULL,
        image_url TEXT,
        description TEXT,
        in_stock BOOLEAN DEFAULT true
      );
    `);
    
    // Carts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        items JSON NOT NULL DEFAULT '[]',
        updated_at TEXT
      );
    `);
    
    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        user_id INTEGER,
        buyer_name TEXT NOT NULL,
        business_name TEXT,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        delivery_instructions TEXT,
        preferred_delivery_date TEXT NOT NULL,
        items JSON NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        total_amount INTEGER NOT NULL,
        created_at TEXT
      );
    `);
    
    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts (user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);`);
    
    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables directly:", error);
    throw error;
  }
}