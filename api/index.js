// Serverless function for Vercel
import express from 'express';
import cors from 'cors';
import path from 'path';
import { setupAuth } from '../server/auth.js';
import { initializeDatabase } from '../server/db.js';
import { registerRoutes } from '../server/routes.js';

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize database
async function init() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Setup auth and routes
init().then(() => {
  // Setup authentication
  setupAuth(app);
});

// Handle API requests
app.all('*', async (req, res) => {
  try {
    // Setup authentication
    setupAuth(app);
    
    // Register routes
    await registerRoutes(app);
    
    // Let Express handle the request
    app._router.handle(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export for Vercel
export default app;