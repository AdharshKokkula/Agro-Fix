import { db, pool } from '../server/db';

async function addSampleOrder() {
  try {
    console.log('Creating sample order...');
    
    // Get products
    const productsQuery = `SELECT * FROM products LIMIT 2`;
    const productResult = await pool.query(productsQuery);
    const products = productResult.rows;
    
    if (products.length < 2) {
      console.log('Not enough products to create a sample order');
      process.exit(1);
    }
    
    const p1 = products[0];
    const p2 = products[1];
    
    // Create order items
    const items = [
      {
        productId: p1.id,
        name: p1.name,
        price: p1.price,
        quantity: p1.min_order_quantity,
        subtotal: p1.price * p1.min_order_quantity
      },
      {
        productId: p2.id,
        name: p2.name,
        price: p2.price,
        quantity: p2.min_order_quantity,
        subtotal: p2.price * p2.min_order_quantity
      }
    ];
    
    const totalAmount = (p1.price * p1.min_order_quantity) + (p2.price * p2.min_order_quantity);
    
    // Generate order number
    const now = new Date();
    const year = now.getFullYear();
    
    // Get the current highest order ID
    const maxIdQuery = `SELECT MAX(id) FROM orders`;
    const maxIdResult = await pool.query(maxIdQuery);
    const maxId = Number(maxIdResult.rows[0].max) || 0;
    const nextId = maxId + 1;
    
    // Format: AGF-YYYY-000001 (padded with leading zeros)
    const orderNumber = `AGF-${year}-${nextId.toString().padStart(6, '0')}`;
    
    // Insert order
    const insertQuery = `
      INSERT INTO orders (
        order_number, user_id, buyer_name, business_name, email, phone,
        delivery_address, city, state, pincode, delivery_instructions,
        preferred_delivery_date, items, total_amount, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `;
    
    const preferredDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const params = [
      orderNumber,
      null, // user_id
      "Sample Customer",
      "Demo Restaurant",
      "customer@example.com",
      "1234567890",
      "123 Sample Street",
      "Demo City",
      "Sample State",
      "123456",
      "Leave at reception",
      preferredDeliveryDate,
      JSON.stringify(items),
      totalAmount,
      "In Progress",
      now.toISOString()
    ];
    
    const result = await pool.query(insertQuery, params);
    console.log(`Sample order created with ID: ${result.rows[0].id} and number: ${result.rows[0].order_number}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample order:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addSampleOrder();