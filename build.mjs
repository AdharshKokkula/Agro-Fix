// build.mjs - Custom build script for Vercel deployment
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Starting custom build process for Vercel deployment...');

// Helper function to run commands
function runCommand(command, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Running command: ${command}`);
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      if (error) {
        console.error(`❌ Command failed: ${command}`);
        return reject(error);
      }
      resolve();
    });
  });
}

// Helper to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Main build function
async function build() {
  try {
    // Setup directories
    const distDir = path.join(__dirname, 'dist');
    const apiDir = path.join(__dirname, 'api');
    
    ensureDir(distDir);
    ensureDir(apiDir);
    
    // 1. Build client
    console.log('🔷 Building client application...');
    await runCommand('npm run build', path.join(__dirname, 'client'));
    
    // 2. Copy API server file
    console.log('🔷 Setting up API for serverless deployment...');
    const apiContent = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import { json } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express server
const app = express();
app.use(cors());
app.use(json());

// Initialize and setup routes
import('../dist/index.js')
  .then(module => {
    console.log('✅ Server initialized successfully');
  })
  .catch(err => {
    console.error('❌ Failed to initialize server:', err);
  });

// Export the Express API
export default app;
    `;
    
    fs.writeFileSync(path.join(apiDir, 'index.js'), apiContent);
    console.log('✅ API entry point created');
    
    // 3. Bundle server with esbuild
    console.log('🔷 Building server application...');
    await runCommand('npx esbuild server/index.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/index.js');
    
    console.log('🎉 Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();