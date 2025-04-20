// Import required modules
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from '../server/routes.js';
import { setupAuth } from '../server/auth.js';
import { initializeDatabase } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize database
try {
  await initializeDatabase();
  console.log('Database initialization successful!');
} catch (error) {
  console.error('Database initialization failed:', error);
}

// Setup authentication
setupAuth(app);

// Register API routes
await registerRoutes(app);

// Serve static frontend from dist folder
const staticPath = path.join(__dirname, '../client/dist');
app.use(express.static(staticPath));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(staticPath, 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle serverless function export for Vercel
export default app;