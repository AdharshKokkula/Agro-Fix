#!/usr/bin/env node

// This file is used by Vercel to start the application
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { registerRoutes } from './server/routes.js';
import { setupAuth } from './server/auth.js';
import { initializeDatabase } from './server/db.js';

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
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Database initialization failed:', error);
}

// Setup authentication
setupAuth(app);

// Register routes
const server = await registerRoutes(app);

// Serve frontend assets from client/dist
app.use(express.static(path.join(__dirname, 'client/dist')));

// For all other routes, serve the index.html for client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// For local dev, start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;