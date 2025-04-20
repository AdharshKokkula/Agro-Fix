#!/bin/bash

# Build the client
echo "Building client..."
cd client
npx vite build
cd ..

# Build the server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed!"