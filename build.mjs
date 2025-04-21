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

// Fix path imports in files
function fixPathImports() {
  console.log('🔧 Fixing path imports for Vercel compatibility...');
  
  // Fix main.tsx
  const mainTsxPath = path.join(__dirname, 'client', 'src', 'main.tsx');
  if (fs.existsSync(mainTsxPath)) {
    let content = fs.readFileSync(mainTsxPath, 'utf8');
    content = content.replace(
      'import { Toaster } from "@/components/ui/toaster";',
      'import { Toaster } from "./components/ui/toaster";'
    );
    fs.writeFileSync(mainTsxPath, content);
    console.log('✅ Fixed main.tsx');
  }
  
  // Fix toaster.tsx
  const toasterPath = path.join(__dirname, 'client', 'src', 'components', 'ui', 'toaster.tsx');
  if (fs.existsSync(toasterPath)) {
    let content = fs.readFileSync(toasterPath, 'utf8');
    content = content.replace(
      'import { useToast } from "@/hooks/use-toast"',
      'import { useToast } from "../../hooks/use-toast"'
    );
    content = content.replace(
      'import {',
      'import {'
    ).replace(
      '} from "@/components/ui/toast"',
      '} from "./toast"'
    );
    fs.writeFileSync(toasterPath, content);
    console.log('✅ Fixed toaster.tsx');
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
    
    // 0. Fix import paths for Vercel
    fixPathImports();
    
    // 1. Build client
    console.log('🔷 Building client application...');
    
    // 1.1 First create a temporary package.json for the client
    const tempPackageJson = {
      name: "agrofix-client",
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview"
      }
    };
    fs.writeFileSync(
      path.join(__dirname, 'client', 'package.json'), 
      JSON.stringify(tempPackageJson, null, 2)
    );
    
    // 1.2 Build with vite directly (not using npm run build which might not work in client dir)
    await runCommand('npx vite build', path.join(__dirname, 'client'));
    
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