// fix-paths.js - A script to fix @ imports for Vercel deployment
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting path alias fix for Vercel deployment...');

// Recursively get all TypeScript and React files
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

// Fix imports in a single file
function fixImportsInFile(filePath) {
  console.log(`Checking ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Get the directory of the current file to calculate relative paths
  const fileDir = path.dirname(filePath);
  const srcDir = path.resolve(path.join('client', 'src'));
  
  // Simple direct replacement for common patterns
  if (content.includes('@/')) {
    // Replace @/ with relative path to src
    const relativeSrcPath = path.relative(fileDir, srcDir).replace(/\\/g, '/');
    const relativePath = relativeSrcPath === '' ? './' : `${relativeSrcPath}/`;
    
    // Replace import statements with relative paths
    const newContent = content.replace(
      /from\s+["']@\/(.*?)["']/g, 
      (match, importPath) => `from "${relativePath}${importPath}"`
    );
    
    // Replace import statements at the beginning of the line
    const finalContent = newContent.replace(
      /^import\s+.*?from\s+["']@\/(.*?)["']/mg,
      (match, importPath) => match.replace(`@/${importPath}`, `${relativePath}${importPath}`)
    );
    
    if (finalContent !== content) {
      fs.writeFileSync(filePath, finalContent);
      console.log(`✅ Fixed imports in ${filePath}`);
      modified = true;
    }
  }
  
  return modified;
}

// Main function
function fixAllPaths() {
  try {
    // Get all TypeScript and React files in src directory
    const srcDir = path.join('client', 'src');
    const allFiles = getAllFiles(srcDir);
    
    console.log(`Found ${allFiles.length} TypeScript/JavaScript files to check.`);
    
    let fixedCount = 0;
    allFiles.forEach(file => {
      const wasFixed = fixImportsInFile(file);
      if (wasFixed) fixedCount++;
    });
    
    console.log(`✅ Fixed imports in ${fixedCount} files!`);
  } catch (error) {
    console.error('❌ Error fixing imports:', error);
  }
}

// Run the script
fixAllPaths();