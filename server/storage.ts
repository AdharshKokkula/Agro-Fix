import { drizzle } from "drizzle-orm/postgres-js";
import { sql, eq, and } from "drizzle-orm";
import { db, pool } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { 
  User, InsertUser, 
  Product, InsertProduct,
  Order, InsertOrder,
  Cart, InsertCart,
  users, products, orders, carts
} from "@shared/schema";
import { nanoid } from 'nanoid';

const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCart(userId: number): Promise<Cart | undefined>;
  updateCart(userId: number, items: any): Promise<Cart>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Session store
  sessionStore: session.Store;
  
  // Initialize with sample data if needed
  initializeSampleData(): Promise<void>;
}

// In-memory implementation (compatible with the original interface)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private carts: Map<number, Cart>;
  private userIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;
  private cartIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.carts = new Map();
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    this.cartIdCounter = 1;
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
        userId: null,
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

  // User profile operations
  async updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Cart operations
  async getCart(userId: number): Promise<Cart | undefined> {
    // Find cart by userId
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }

  async updateCart(userId: number, items: any): Promise<Cart> {
    // Find existing cart or create new one
    let cart = await this.getCart(userId);
    const now = new Date().toISOString();
    
    if (cart) {
      // Update existing cart
      cart = { ...cart, items, updatedAt: now };
      this.carts.set(cart.id, cart);
    } else {
      // Create new cart
      const id = this.cartIdCounter++;
      cart = { id, userId, items, updatedAt: now };
      this.carts.set(id, cart);
    }
    
    return cart;
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
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.orderNumber === orderNumber);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const year = now.getFullYear();
    // Format: AGF-YYYY-000001 (padded with leading zeros)
    const orderNumber = `AGF-${year}-${id.toString().padStart(6, '0')}`;
    
    const newOrder: Order = { 
      id,
      orderNumber,
      userId: order.userId ?? null,
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
    const now = new Date().toISOString();
    
    const newUser: User = { 
      id, 
      username: user.username, 
      password: user.password,
      isAdmin: user.isAdmin ?? false,
      email: user.email ?? null,
      fullName: user.fullName ?? null,
      phone: user.phone ?? null,
      preferredAddress: user.preferredAddress ?? null,
      preferredCity: user.preferredCity ?? null,
      preferredState: user.preferredState ?? null,
      preferredPincode: user.preferredPincode ?? null,
      createdAt: now
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Initialize sample data (already handled in constructor)
  async initializeSampleData(): Promise<void> {
    // This is called by DatabaseStorage but already handled by constructor in MemStorage
    return;
  }
}

// PostgreSQL database implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize session store with PostgreSQL
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize sample data
    this.initializeSampleData().catch(err => {
      console.error("Error initializing sample data:", err);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const now = new Date().toISOString();
    
    // Include creation date
    const userData = { 
      ...user, 
      createdAt: now,
      // Set default values for new fields
      email: user.email ?? null,
      fullName: user.fullName ?? null,
      phone: user.phone ?? null,
      preferredAddress: user.preferredAddress ?? null,
      preferredCity: user.preferredCity ?? null,
      preferredState: user.preferredState ?? null,
      preferredPincode: user.preferredPincode ?? null
    };
    
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }
  
  async updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true; // In SQL deleting a non-existent row is not an error
  }
  
  // Cart operations
  async getCart(userId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart;
  }
  
  async updateCart(userId: number, items: any): Promise<Cart> {
    const now = new Date().toISOString();
    const existingCart = await this.getCart(userId);
    
    if (existingCart) {
      // Update existing cart
      const [updatedCart] = await db
        .update(carts)
        .set({ items, updatedAt: now })
        .where(eq(carts.userId, userId))
        .returning();
      
      return updatedCart;
    } else {
      // Create new cart
      const [newCart] = await db
        .insert(carts)
        .values({ userId, items, updatedAt: now })
        .returning();
      
      return newCart;
    }
  }
  
  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const now = new Date();
    const year = now.getFullYear();
    
    // First, get the current highest order ID
    const result = await db.select({ maxId: sql`MAX(id)` }).from(orders);
    const maxId = result[0].maxId || 0;
    const nextId = maxId + 1;
    
    // Format: AGF-YYYY-000001 (padded with leading zeros)
    const orderNumber = `AGF-${year}-${nextId.toString().padStart(6, '0')}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        orderNumber,
        createdAt: now.toISOString()
      })
      .returning();
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder;
  }
  
  // Initialize with sample data if needed
  async initializeSampleData(): Promise<void> {
    try {
      // Check if we already have products and users
      const productCount = await db.select({ count: sql`count(*)` }).from(products);
      const userCount = await db.select({ count: sql`count(*)` }).from(users);
      
      // If we have no products, add sample products
      if (productCount[0].count === 0) {
        await this.initializeProducts();
      }
      
      // If we have no users, add admin user
      if (userCount[0].count === 0) {
        await this.initializeAdminUser();
      }
      
      // Check if we have orders
      const orderCount = await db.select({ count: sql`count(*)` }).from(orders);
      
      // If we have no orders, add a sample order
      if (orderCount[0].count === 0) {
        setTimeout(() => this.createSampleOrder(), 2000); // Allow time for products to be inserted
      }
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }
  
  private async initializeProducts() {
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

    console.log("Initializing sample products...");
    await db.insert(products).values(sampleProducts);
    console.log("Sample products initialized successfully");
  }
  
  private async initializeAdminUser() {
    try {
      // Import hashPassword function
      const { hashPassword } = await import('./auth');
      
      // Create admin user with fixed credentials
      const password = await hashPassword("admin123");
      const now = new Date().toISOString();
      
      await db.insert(users).values({
        username: "admin",
        password,
        isAdmin: true,
        createdAt: now,
        email: null,
        fullName: null,
        phone: null,
        preferredAddress: null,
        preferredCity: null,
        preferredState: null,
        preferredPincode: null
      });
      
      console.log("Admin user created successfully");
    } catch (error) {
      console.error("Error creating admin user:", error);
    }
  }
  
  private async createSampleOrder() {
    try {
      // Get some products
      const productList = await this.getProducts();
      if (productList.length < 2) {
        console.log("Not enough products to create sample order");
        return;
      }
      
      const p1 = productList[0];
      const p2 = productList[1];
      
      // Create sample order items
      const items = [
        {
          productId: p1.id,
          name: p1.name,
          price: p1.price,
          quantity: p1.minOrderQuantity,
          subtotal: p1.price * p1.minOrderQuantity
        },
        {
          productId: p2.id,
          name: p2.name,
          price: p2.price,
          quantity: p2.minOrderQuantity,
          subtotal: p2.price * p2.minOrderQuantity
        }
      ];
      
      const totalAmount = (p1.price * p1.minOrderQuantity) + (p2.price * p2.minOrderQuantity);
      
      // Sample order
      const sampleOrder: InsertOrder = {
        userId: null,
        buyerName: "Sample Customer",
        businessName: "Demo Restaurant",
        email: "customer@example.com",
        phone: "1234567890",
        deliveryAddress: "123 Sample Street",
        city: "Demo City",
        state: "Sample State",
        pincode: "123456",
        deliveryInstructions: "Leave at reception",
        preferredDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        items,
        totalAmount,
        status: "In Progress"
      };
      
      const order = await this.createOrder(sampleOrder);
      console.log(`Sample order created with ID: ${order.id} and number: ${order.orderNumber}`);
    } catch (error) {
      console.error("Error creating sample order:", error);
    }
  }
}

// Choose storage implementation based on whether we have a database available
const useDatabase = !!process.env.DATABASE_URL;

export const storage: IStorage = useDatabase 
  ? new DatabaseStorage()
  : new MemStorage();