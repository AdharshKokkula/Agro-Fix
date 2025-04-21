// api/index.js - Serverless entry point for Vercel deployment
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';
import { json } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express server
const app = express();
app.use(cors());
app.use(json());

// Import server bundle and initialize routes
import('../dist/index.js')
  .then(module => {
    console.log('✅ Server initialized successfully');
  })
  .catch(err => {
    console.error('❌ Failed to initialize server:', err);
  });

// Export the Express API for Vercel serverless functions
export default app;