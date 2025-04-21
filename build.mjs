// build.mjs - Simplified build script for Vercel deployment
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Starting simplified build process for Vercel deployment...');

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

// Fix path aliases in all files
function fixPathAliases() {
  console.log('🔧 Removing all @/ path references in source files...');
  
  // Get all .tsx and .ts files in the client/src directory
  function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (/\.(tsx?|jsx?)$/.test(file)) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }
  
  // Get all source files
  const srcDir = path.join(__dirname, 'client', 'src');
  const files = getAllFiles(srcDir);
  
  // Remove all @/ imports (replace with relative paths)
  let fixedCount = 0;
  
  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all @/ path references with ./ 
    let newContent = content;
    
    // Handle import statements
    newContent = newContent.replace(/@\/components\//g, './components/');
    newContent = newContent.replace(/@\/hooks\//g, './hooks/');
    newContent = newContent.replace(/@\/pages\//g, './pages/');
    newContent = newContent.replace(/@\/lib\//g, './lib/');
    newContent = newContent.replace(/@\/store\//g, './store/');
    
    // Handle JSX references
    newContent = newContent.replace(/<Toaster\s*\/>/g, '');
    
    // Handle removal of import { Toaster } statements
    newContent = newContent.replace(/import\s+{.*?Toaster.*?}\s+from\s+["'].*?\/toaster["'];?(\r?\n)?/g, '');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed path aliases in ${filePath}`);
      fixedCount++;
    }
  });
  
  console.log(`🔧 Fixed ${fixedCount} files`);
}

// Main build function
async function build() {
  try {
    // Setup directories
    const distDir = path.join(__dirname, 'dist');
    const apiDir = path.join(__dirname, 'api');
    
    ensureDir(distDir);
    ensureDir(apiDir);
    
    // 1. Fix all path aliases
    fixPathAliases();
    
    // 2. Build client
    console.log('🔷 Building client application...');
    await runCommand('npx vite build', path.join(__dirname, 'client'));
    
    // 3. Create API entry point
    console.log('🔷 Setting up API for serverless deployment...');
    const apiContent = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import express from 'express';
import cors from 'cors';
import { json } from 'express';

// Create Express server
const app = express();
app.use(cors());
app.use(json());

// Initialize and setup routes
import('../dist/index.js')
  .then(() => {
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
    
    // 4. Bundle server
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