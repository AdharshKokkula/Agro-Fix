// fix-imports.js
// A script to fix import paths for Vercel deployment
import fs from 'fs';

// Function to fix import paths in a file
function fixImportsInFile(filePath, replacements) {
  console.log(`Fixing imports in ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in ${filePath}`);
    return true;
  } else {
    console.log(`No changes needed in ${filePath}`);
    return false;
  }
}

// Main function to fix imports
async function fixImports() {
  console.log('🔍 Looking for problematic imports...');

  // Fix main.tsx
  fixImportsInFile('client/src/main.tsx', [
    [
      'import { Toaster } from "@/components/ui/toaster";',
      'import { Toaster } from "./components/ui/toaster";'
    ]
  ]);

  // Fix any other files with alias imports if needed
  // List of files to check for @ imports
  const filesToFix = [
    'client/src/components/ui/toaster.tsx'
  ];

  for (const file of filesToFix) {
    fixImportsInFile(file, [
      [
        'import { useToast } from "@/hooks/use-toast"',
        'import { useToast } from "../../hooks/use-toast"'
      ],
      [
        'import {[\\s\\S]*?} from "@/components/ui/toast"',
        'import {$1} from "./toast"'
      ]
    ]);
  }

  console.log('✅ Import paths have been fixed');
}

// Run the function
fixImports().catch(console.error);