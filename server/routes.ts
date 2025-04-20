import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Helper function to handle validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: fromZodError(error).message };
      }
      return { data: null, error: 'Invalid request data' };
    }
  };

  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertProductSchema, req.body);
      if (error) {
        return res.status(400).json({ message: error });
      }

      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const { data, error } = validateRequest(insertProductSchema.partial(), req.body);
      if (error) {
        return res.status(400).json({ message: error });
      }

      const product = await storage.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // If user is admin, return all orders
      // Otherwise, filter orders by user email (assuming email is used in orders)
      const orders = await storage.getOrders();
      
      if (req.user && req.user.isAdmin) {
        // Admin sees all orders
        res.json(orders);
      } else if (req.user) {
        // Regular users only see their own orders (matching by email)
        const userOrders = orders.filter(order => order.email === req.user!.username);
        res.json(userOrders);
      } else {
        res.status(401).json({ message: "Authentication required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the user is authorized to view this order
      // Admin can view all orders, regular users can only view their own orders
      if (req.user && (!req.user.isAdmin && order.email !== req.user.username)) {
        return res.status(403).json({ message: "Unauthorized access to this order" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertOrderSchema, req.body);
      if (error) {
        return res.status(400).json({ message: error });
      }

      const order = await storage.createOrder(data);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Invalid status" });
      }

      const validStatuses = ["Pending", "In Progress", "Out for Delivery", "Delivered"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const cart = await storage.getCart(req.user.id);
      res.json(cart || { items: [] });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Invalid cart items format" });
      }

      const cart = await storage.updateCart(req.user.id, items);
      res.json(cart);
    } catch (error) {
      console.error("Failed to update cart:", error);
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  // Order tracking by order number (public route)
  app.get("/api/track/:orderNumber", async (req: Request, res: Response) => {
    try {
      const { orderNumber } = req.params;
      if (!orderNumber) {
        return res.status(400).json({ message: "Order number is required" });
      }

      const order = await storage.getOrderByNumber(orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Return limited information for public tracking
      res.json({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        preferredDeliveryDate: order.preferredDeliveryDate,
        totalAmount: order.totalAmount
      });
    } catch (error) {
      console.error("Failed to track order:", error);
      res.status(500).json({ message: "Failed to track order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
