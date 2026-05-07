#!/usr/bin/env node

const express = require('express')
const path = require('path')
const fs = require('fs')
const compression = require('compression')

const app = express()
const distPath = path.join(__dirname, 'dist', 'www')

console.log('Starting server...')
console.log('Serving from:', distPath)
console.log('Files in dist path:', fs.existsSync(distPath) ? 'EXISTS' : 'DOES NOT EXIST')

// Enable compression
app.use(compression())

// Serve static files with proper cache headers
// index.html must never be cached — it references hashed bundles that change each build
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false,
  fallthrough: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
    }
  }
}))

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// SPA fallback: redirect all non-file requests to index.html
app.get('*', (req, res) => {
  const filePath = path.join(distPath, req.path)
  const indexPath = path.join(distPath, 'index.html')

  console.log(`Checking: ${filePath}`)

  try {
    // If it's a real file that exists, let express.static handle it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      console.log(`File exists, serving: ${filePath}`)
      return res.sendFile(filePath)
    }

    // Otherwise serve index.html for SPA routing
    console.log(`Serving index.html for SPA route: ${req.path}`)
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    return res.sendFile(indexPath)
  } catch (err) {
    console.error(`Error serving ${req.path}:`, err.message)
    return res.status(404).send('File not found')
  }
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`✓ Angular SPA server running on port ${PORT}`)
  console.log(`✓ Serving from: ${distPath}`)
});

