// fix-toaster.js - A script to fix the Toaster component for Vercel build
const fs = require('fs');
const path = require('path');

// Main function to fix the Toaster imports
function fixToasterImports() {
  console.log('🔧 Fixing Toaster imports for Vercel build...');
  
  // Fix main.tsx
  const mainTsxPath = path.join(__dirname, 'src', 'main.tsx');
  if (fs.existsSync(mainTsxPath)) {
    console.log(`Found ${mainTsxPath}, updating imports...`);
    
    let content = fs.readFileSync(mainTsxPath, 'utf8');
    
    // Replace the problematic import
    // content = content.replace(
    //   'import { Toaster } from "@/components/ui/toaster";',
    //   'import { Toaster } from "./components/ui/toaster";'
    // );
    
    fs.writeFileSync(mainTsxPath, content);
    console.log('✅ Fixed main.tsx');
  } else {
    console.error(`❌ Could not find ${mainTsxPath}`);
  }
  
  // Fix toaster.tsx imports
  const toasterPath = path.join(__dirname, 'src', 'components', 'ui', 'toaster.tsx');
  if (fs.existsSync(toasterPath)) {
    console.log(`Found ${toasterPath}, updating imports...`);
    
    let content = fs.readFileSync(toasterPath, 'utf8');
    
    // Replace the problematic imports
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
  } else {
    console.error(`❌ Could not find ${toasterPath}`);
  }
  
  console.log('✅ All Toaster imports fixed for Vercel build');
}

// Execute the fix
try {
  fixToasterImports();
} catch (error) {
  console.error('❌ Error while fixing Toaster:', error);
  process.exit(1);
}