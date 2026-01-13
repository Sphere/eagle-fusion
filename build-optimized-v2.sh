#!/bin/bash

# Advanced Angular 16 Build Optimization Script
echo "🚀 Starting Angular 16 optimized build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf .angular/cache/

# Optimize CSS first
echo "🎨 Optimizing CSS..."
npm run tailwind

# Check for large files that could cause issues
echo "📊 Checking for large source files..."
find src -name "*.scss" -size +500k -exec echo "⚠️  Large SCSS file: {}" \;
find src -name "*.css" -size +500k -exec echo "⚠️  Large CSS file: {}" \;

# Build with maximum optimizations
echo "🏗️  Building with maximum optimizations..."
NODE_OPTIONS="--max_old_space_size=8192" ng build --configuration production \
  --optimization \
  --aot \
  --build-optimizer \
  --vendor-chunk=false \
  --named-chunks=false \
  --source-map=false \
  --stats-json

# Analyze bundle if stats were generated
if [ -f "dist/www/fusion/stats.json" ]; then
  echo "📈 Bundle analysis available. Run: npm run analyze:bundle"
fi

# Show bundle sizes
echo "📦 Bundle sizes:"
if [ -d "dist/www/fusion" ]; then
  ls -lh dist/www/fusion/*.js dist/www/fusion/*.css 2>/dev/null | head -10
fi

echo "✅ Build complete!"

# Compress for production if needed
if [ "$1" = "--compress" ]; then
  echo "🗜️  Compressing assets..."
  npm run compress:gzip
  npm run compress:brotli
fi