import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  User, InsertUser, 
  Product, InsertProduct,
  Order, InsertOrder 
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private userIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with sample products
    this.initializeProducts();
    
    // Create admin user
    this.initializeAdminUser();
  }
  
  private async initializeAdminUser() {
    try {
      // Check if admin already exists
      const existingAdmin = Array.from(this.users.values()).find(user => user.isAdmin);
      if (existingAdmin) return;
      
      // Import hashPassword function from auth.ts
      const { hashPassword } = await import('./auth');
      
      // Create admin user with fixed credentials
      const adminUser: InsertUser = {
        username: "admin",
        password: await hashPassword("admin123"),
        isAdmin: true
      };
      
      await this.createUser(adminUser);
      console.log("Admin user created successfully");
      
      // Create sample order after admin is created
      setTimeout(() => this.createSampleOrder(), 1000);
    } catch (error) {
      console.error("Error creating admin user:", error);
    }
  }
  
  private async createSampleOrder() {
    try {
      // Check if orders already exist
      if (this.orders.size > 0) return;
      
      // Get some products
      const products = await this.getProducts();
      if (products.length === 0) return;
      
      // Create a sample order
      const sampleOrder: InsertOrder = {
        buyerName: "Sample Customer",
        businessName: "Demo Restaurant",
        email: "customer@example.com",
        phone: "1234567890",
        deliveryAddress: "123 Sample Street",
        city: "Demo City",
        state: "Sample State",
        pincode: "123456",
        deliveryInstructions: "Leave at reception",
        preferredDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in future
        items: [
          {
            productId: products[0].id,
            name: products[0].name,
            price: products[0].price,
            quantity: products[0].minOrderQuantity,
            subtotal: products[0].price * products[0].minOrderQuantity
          },
          {
            productId: products[1].id,
            name: products[1].name,
            price: products[1].price,
            quantity: products[1].minOrderQuantity,
            subtotal: products[1].price * products[1].minOrderQuantity
          }
        ],
        totalAmount: (products[0].price * products[0].minOrderQuantity) + 
                     (products[1].price * products[1].minOrderQuantity),
        status: "In Progress"
      };
      
      const order = await this.createOrder(sampleOrder);
      console.log(`Sample order created with ID: ${order.id}`);
    } catch (error) {
      console.error("Error creating sample order:", error);
    }
  }

  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Tomatoes",
        category: "Vegetables",
        price: 2500, // 25.00 in cents
        minOrderQuantity: 10,
        imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
        description: "Fresh, ripe tomatoes",
        inStock: true
      },
      {
        name: "Apples",
        category: "Fruits",
        price: 8000, // 80.00 in cents
        minOrderQuantity: 20,
        imageUrl: "https://images.unsplash.com/photo-1587049716454-0136927d45f3",
        description: "Crisp, juicy apples",
        inStock: true
      },
      {
        name: "Potatoes",
        category: "Vegetables",
        price: 1800, // 18.00 in cents
        minOrderQuantity: 25,
        imageUrl: "https://images.unsplash.com/photo-1590005354167-6da97870c757",
        description: "Farm fresh potatoes",
        inStock: true
      },
      {
        name: "Spinach",
        category: "Leafy Greens",
        price: 3500, // 35.00 in cents
        minOrderQuantity: 5,
        imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224",
        description: "Organic spinach leaves",
        inStock: true
      }
    ];

    sampleProducts.forEach(product => this.createProduct(product));
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { 
      id, 
      name: product.name,
      category: product.category,
      price: product.price,
      minOrderQuantity: product.minOrderQuantity,
      imageUrl: product.imageUrl ?? null,
      description: product.description ?? null,
      inStock: product.inStock ?? true,
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = { 
      id,
      buyerName: order.buyerName,
      businessName: order.businessName ?? null,
      email: order.email,
      phone: order.phone,
      deliveryAddress: order.deliveryAddress,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      deliveryInstructions: order.deliveryInstructions ?? null,
      preferredDeliveryDate: order.preferredDeliveryDate,
      items: order.items,
      status: order.status ?? "Pending",
      totalAmount: order.totalAmount,
      createdAt: now.toISOString()
    };
    
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      return undefined;
    }
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      id, 
      username: user.username, 
      password: user.password,
      isAdmin: user.isAdmin ?? false
    };
    this.users.set(id, newUser);
    return newUser;
  }
}

export const storage = new MemStorage();