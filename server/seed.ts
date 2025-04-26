import { pool } from "./db";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Insert admin user
    await pool.query(`
      INSERT INTO users (username, password, is_admin, email, full_name, phone, preferred_address, preferred_city, preferred_state, preferred_pincode, created_at)
      VALUES
      ('admin', 'admin123', true, 'admin@agrofix.com', 'Admin User', '9876543210', '123 Admin Lane', 'Admin City', 'Admin State', '123456', NOW()),
      ('john', 'john123', false, 'john.doe@example.com', 'John Doe', '9123456789', '456 Elm Street', 'Springfield', 'Illinois', '62704', NOW()),
      ('jane', 'jane123', false, 'jane.smith@example.com', 'Jane Smith', '9876543211', '789 Maple Avenue', 'Greenwood', 'Indiana', '46143', NOW())
      ON CONFLICT (username) DO NOTHING;
    `);

    // Insert products
    await pool.query(`
      INSERT INTO products (name, category, price, min_order_quantity, image_url, description, in_stock)
      VALUES
      ('Organic Tomatoes', 'Vegetables', 50, 1, 'https://via.placeholder.com/150', 'Fresh organic tomatoes grown locally.', true),
      ('Farm Fresh Eggs', 'Dairy', 120, 1, 'https://via.placeholder.com/150', 'Free-range farm fresh eggs.', true),
      ('Whole Wheat Bread', 'Bakery', 80, 1, 'https://via.placeholder.com/150', 'Healthy whole wheat bread baked fresh daily.', true),
      ('Almond Milk', 'Beverages', 200, 1, 'https://via.placeholder.com/150', 'Dairy-free almond milk, rich in nutrients.', true),
      ('Honey', 'Condiments', 300, 1, 'https://via.placeholder.com/150', 'Pure organic honey sourced from local farms.', true)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert sample cart for a user
    await pool.query(`
      INSERT INTO carts (user_id, items, updated_at)
      VALUES
      (2, '[{"productId": 1, "quantity": 3, "subtotal": 150}, {"productId": 2, "quantity": 2, "subtotal": 240}]', NOW()),
      (3, '[{"productId": 3, "quantity": 1, "subtotal": 80}, {"productId": 4, "quantity": 2, "subtotal": 400}]', NOW())
      ON CONFLICT (user_id) DO NOTHING;
    `);

    // Insert sample orders
    await pool.query(`
      INSERT INTO orders (order_number, user_id, buyer_name, business_name, email, phone, delivery_address, city, state, pincode, delivery_instructions, preferred_delivery_date, items, status, total_amount, created_at)
      VALUES
      ('AGF-2025-000001', 2, 'John Doe', 'Doe Farms', 'john.doe@example.com', '9123456789', '456 Elm Street', 'Springfield', 'Illinois', '62704', 'Leave at the front door.', '2025-05-01', '[{"productId": 1, "quantity": 3, "subtotal": 150}, {"productId": 2, "quantity": 2, "subtotal": 240}]', 'Pending', 390, NOW()),
      ('AGF-2025-000002', 3, 'Jane Smith', 'Smith Organics', 'jane.smith@example.com', '9876543211', '789 Maple Avenue', 'Greenwood', 'Indiana', '46143', 'Ring the bell upon delivery.', '2025-05-02', '[{"productId": 3, "quantity": 1, "subtotal": 80}, {"productId": 4, "quantity": 2, "subtotal": 400}]', 'Pending', 480, NOW())
      ON CONFLICT (order_number) DO NOTHING;
    `);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
