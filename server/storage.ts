import { type Order, type Product, type InsertOrder, type InsertProduct } from "@shared/schema";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private productIdCounter: number;
  private orderIdCounter: number;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    
    // Initialize with sample products
    this.initializeProducts();
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
    const newProduct: Product = { id, ...product };
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
      ...order,
      createdAt: now
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
}

export const storage = new MemStorage();
