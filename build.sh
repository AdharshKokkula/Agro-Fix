#!/bin/bash

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Build the client
echo "Building client..."
cd client
npx vite build
cd ..

# Copy necessary files to make things work with ES modules
echo "Setting up API for Vercel..."
mkdir -p api
cp -f api/index.js api/index.js.bak  # backup in case it exists

# Create serverless function entry point
echo "Creating Vercel serverless function entry point..."
cat > api/index.js << 'EOF'
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from '../server/routes.js';
import { setupAuth } from '../server/auth.js';
import { initializeDatabase } from '../server/db.js';

// Create app
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

// Export for Vercel serverless function
export default app;
EOF

echo "Build completed successfully!"