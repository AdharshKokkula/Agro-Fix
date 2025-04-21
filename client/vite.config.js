// vite.config.js for client directory
// Specialized for Vercel deployment with proper path resolution

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // We're explicitly NOT using @ aliases to avoid build issues
      // Instead we use relative paths for all imports
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Explicitly set external to avoid the @ path resolution errors
      external: [],
    },
  },
});