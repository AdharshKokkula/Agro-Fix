// build.mjs - Custom build script for Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Helper function to execute commands
function runCommand(command) {
  console.log(`Executing: ${command}`);
  return execSync(command, { stdio: 'inherit' });
}

// Ensure directories exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === '1';
console.log(`Building on ${isVercel ? 'Vercel' : 'local environment'}`);

// Build the client first (frontend)
console.log('\n📦 Building client...');
try {
  // Navigate to client directory and build
  runCommand('cd client && npx vite build');
  console.log('✅ Client build completed');
} catch (error) {
  console.error('❌ Client build failed:', error);
  process.exit(1);
}

// Build the server (backend)
console.log('\n📦 Building server...');
try {
  runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
  console.log('✅ Server build completed');
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}

// Prepare for deployment
console.log('\n📦 Copying files for deployment...');

// Ensure the API directory exists for Vercel
if (!fs.existsSync('api')) {
  fs.mkdirSync('api');
}

// Create or update special file for Vercel
const apiContent = `// Serverless function for Vercel
import express from 'express';
import cors from 'cors';
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
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await init();
    // Setup authentication
    setupAuth(app);
    initialized = true;
  }
}

// Handle API requests
app.all('*', async (req, res) => {
  try {
    await ensureInitialized();
    
    // Register routes for each request (necessary for serverless)
    await registerRoutes(app);
    
    // Let Express handle the request
    app._router.handle(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export for Vercel
export default app;`;

fs.writeFileSync('api/index.js', apiContent);
console.log('✅ Created API handler for Vercel');

console.log('\n✅ Build completed successfully');