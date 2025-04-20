import { db, pool } from '../server/db';
import { hashPassword } from '../server/auth';

async function addAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const checkQuery = `SELECT * FROM users WHERE username = 'admin'`;
    const existingAdmin = await pool.query(checkQuery);
    
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user with fixed credentials
    const password = await hashPassword("admin123");
    const now = new Date().toISOString();
    
    const insertQuery = `
      INSERT INTO users (username, password, is_admin, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const result = await pool.query(insertQuery, ["admin", password, true, now]);
    console.log('Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addAdmin();