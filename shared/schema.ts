import { pgTable, text, serial, integer, json, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (for admin authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  email: text("email"), // Optional email for communication
  fullName: text("full_name"), // Optional full name
  phone: text("phone"), // Optional phone number
  preferredAddress: text("preferred_address"), // Optional preferred address
  preferredCity: text("preferred_city"),
  preferredState: text("preferred_state"),
  preferredPincode: text("preferred_pincode"),
  createdAt: text("created_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(), // Price in cents
  minOrderQuantity: integer("min_order_quantity").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  inStock: boolean("in_stock").default(true),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Cart schema - store cart items for users
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Linked to user
  items: json("items").notNull().default('[]'), // Serialized JSON array of cart items
  updatedAt: text("updated_at"),
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  updatedAt: true,
});

// Cart Item schema (for validation only, stored in JSON)
export const cartItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
});

export const cartItemsSchema = z.array(cartItemSchema);

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // Generated unique order number for tracking (e.g., ORD-12345)
  userId: integer("user_id"), // Optional link to user (can be null for guest orders)
  buyerName: text("buyer_name").notNull(),
  businessName: text("business_name"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  deliveryInstructions: text("delivery_instructions"),
  preferredDeliveryDate: text("preferred_delivery_date").notNull(),
  items: json("items").notNull(), // Serialized JSON array of order items
  status: text("status").notNull().default("Pending"), // Pending, In Progress, Out for Delivery, Delivered
  totalAmount: integer("total_amount").notNull(), // Total amount in cents
  createdAt: text("created_at"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true, // Auto-generated
  createdAt: true,
});

// Order Item schema (for validation only, not stored in DB)
export const orderItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
});

export const orderItemsSchema = z.array(orderItemSchema);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof carts.$inferSelect;
export type CartItem = z.infer<typeof cartItemSchema>;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderItem = z.infer<typeof orderItemSchema>;
