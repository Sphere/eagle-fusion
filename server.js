#!/usr/bin/env node

const express = require('express')
const path = require('path')
const fs = require('fs')
const compression = require('compression')

const app = express()
const distPath = path.join(__dirname, 'dist', 'www', 'fusion')

console.log('Starting server...')
console.log('Serving from:', distPath)
console.log('Files in dist path:', fs.existsSync(distPath) ? 'EXISTS' : 'DOES NOT EXIST')

// Enable compression
app.use(compression())

// Serve static files with proper cache headers
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false,
  // Enable fallthrough so 404s go to the next handler
  fallthrough: true
}))

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// SPA fallback: redirect all non-file requests to index.html
app.get('/*', (req, res) => {
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

