import { db, pool } from '../server/db';
import { products } from '../shared/schema';

async function addProducts() {
  try {
    console.log('Starting to add products...');
    
    // Sample products data
    const sampleProducts = [
      {
        name: "Tomatoes",
        category: "Vegetables",
        price: 2500, // 25.00 in cents
        min_order_quantity: 10,
        image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
        description: "Fresh, ripe tomatoes",
        in_stock: true
      },
      {
        name: "Apples",
        category: "Fruits",
        price: 8000, // 80.00 in cents
        min_order_quantity: 20,
        image_url: "https://images.unsplash.com/photo-1587049716454-0136927d45f3",
        description: "Crisp, juicy apples",
        in_stock: true
      },
      {
        name: "Potatoes",
        category: "Vegetables",
        price: 1800, // 18.00 in cents
        min_order_quantity: 25,
        image_url: "https://images.unsplash.com/photo-1590005354167-6da97870c757",
        description: "Farm fresh potatoes",
        in_stock: true
      },
      {
        name: "Spinach",
        category: "Leafy Greens",
        price: 3500, // 35.00 in cents
        min_order_quantity: 5,
        image_url: "https://images.unsplash.com/photo-1603833665858-e61d17a86224",
        description: "Organic spinach leaves",
        in_stock: true
      }
    ];
    
    // Direct SQL insertion to avoid any Drizzle ORM issues
    const insertQuery = `
      INSERT INTO products (name, category, price, min_order_quantity, image_url, description, in_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    // Insert each product
    for (const product of sampleProducts) {
      const result = await pool.query(insertQuery, [
        product.name,
        product.category,
        product.price,
        product.min_order_quantity,
        product.image_url,
        product.description,
        product.in_stock
      ]);
      console.log(`Added product: ${product.name}`);
    }
    
    console.log('Products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addProducts();