-- Initial database schema

-- Users table
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

-- Products table
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

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  items JSON NOT NULL DEFAULT '[]',
  updated_at TEXT
);

-- Orders table
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);