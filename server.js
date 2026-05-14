#!/usr/bin/env node

const express = require('express')
const path = require('path')
const fs = require('fs')
const compression = require('compression')

const app = express()

// Prerender outputs to dist/www/fusion (matches angular.json outputPath)
const distPath = path.join(__dirname, 'dist', 'www', 'fusion')

console.log('Starting server...')
console.log('Serving from:', distPath)
console.log('Files in dist path:', fs.existsSync(distPath) ? 'EXISTS' : 'DOES NOT EXIST')

// Enable compression
app.use(compression())

// Hashed filenames (main.abc123.js) match this pattern — safe to cache 1 year
const HASHED_FILE = /\.[a-f0-9]{8,20}\.(js|css|mjs)$/

// Files that are never hashed and must stay fresh
const NO_CACHE_FILES = [
  'index.html',
  'env.js',         // runtime config loaded at app start
  'robots.txt',
  'sitemap.xml',
  'ngsw.json',      // service worker manifest
  'ngsw-worker.js',
]

app.use(express.static(distPath, {
  maxAge: 0,        // default: no cache (overridden per file type below)
  etag: true,
  fallthrough: true,
  setHeaders: (res, filePath) => {
    const file = path.basename(filePath)

    if (NO_CACHE_FILES.some(f => filePath.endsWith(f))) {
      // Never cache — always fetch fresh
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
    } else if (HASHED_FILE.test(filePath)) {
      // Content-hashed bundles — immutable, safe to cache for 1 year
      res.set('Cache-Control', 'public, max-age=31536000, immutable')
    } else if (/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(filePath)) {
      // Fonts and images — cache 30 days (rarely change between deploys)
      res.set('Cache-Control', 'public, max-age=2592000')
    } else if (/\.(json|xml|txt)$/.test(filePath)) {
      // Config/translation/data files — no content hash, cache 1 hour only
      res.set('Cache-Control', 'public, max-age=3600, must-revalidate')
    } else {
      // Everything else — revalidate every time
      res.set('Cache-Control', 'no-cache')
    }
  }
}))

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// Route handler: prerendered files → SPA fallback
app.get('*', (req, res) => {
  const filePath = path.join(distPath, req.path)
  const prerenderIndexPath = path.join(distPath, req.path, 'index.html')
  const spaIndexPath = path.join(distPath, 'index.html')

  const noCache = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  try {
    // 1. Exact file match (JS/CSS/assets handled by express.static above, but safety net)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      console.log(`Static file: ${filePath}`)
      return res.sendFile(filePath)
    }

    // 2. Prerendered route — directory contains its own index.html
    if (fs.existsSync(prerenderIndexPath)) {
      console.log(`Prerendered: ${prerenderIndexPath}`)
      res.set(noCache)
      return res.sendFile(prerenderIndexPath)
    }

    // 3. SPA fallback for all other routes (auth-protected, dynamic pages)
    console.log(`SPA fallback for: ${req.path}`)
    res.set(noCache)
    return res.sendFile(spaIndexPath)
  } catch (err) {
    console.error(`Error serving ${req.path}:`, err.message)
    return res.status(404).send('File not found')
  }
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`)
  console.log(`✓ Serving from: ${distPath}`)
})
