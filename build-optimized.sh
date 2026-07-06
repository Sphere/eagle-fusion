#!/bin/bash

# Angular 16 Build Optimization Script

echo "🚀 Starting Angular 16 optimized build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/

# Set Node.js memory optimization
export NODE_OPTIONS="--max-old-space-size=8192 --optimization-strategy=size"

# Run build with optimizations
echo "📦 Building with optimizations..."
ng build --configuration production \
  --output-path=dist/www \
  --base-href=/ \
  --source-map=false \
  --build-optimizer=true \
  --vendor-chunk=false \
  --common-chunk=false \
  --delete-output-path=true \
  --preserve-symlinks=false

# Post-build optimizations
echo "⚡ Running post-build optimizations..."

# Compress assets
if command -v gzip &> /dev/null; then
  echo "🗜️ Compressing assets with gzip..."
  find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -9 -k {} \;
fi

if command -v brotli &> /dev/null; then
  echo "🗜️ Compressing assets with brotli..."
  find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec brotli -k {} \;
fi

echo "✅ Build optimization complete!"

# Display build size information
echo "📊 Build size information:"
du -sh dist/
echo "📁 Largest files:"
find dist/ -type f -name "*.js" -exec ls -lh {} \; | sort -k 5 -hr | head -10