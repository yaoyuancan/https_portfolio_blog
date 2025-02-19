const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const https = require('https')
const fs = require('fs')
const path = require('path')

// Initialize Express application
const app = express()

// SSL certificate configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.pem'))
}

// Middleware configuration
app.use(helmet()) // Add security HTTP headers
app.use(cors()) // Enable CORS
app.use(morgan('dev')) // Logger middleware
app.use(express.json()) // Parse JSON request body
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded request body

// Import routes
const portfolioRoutes = require('./routes/portfolioRoutes')
const blogRoutes = require('./routes/blogRoutes')

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Developer Portfolio API Service',
    endpoints: {
      portfolios: '/api/portfolios',
      blogs: '/api/blogs'
    }
  })
})

// Register routes
app.use('/api', portfolioRoutes)
app.use('/api', blogRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal Server Error' })
})

// Start HTTPS server
const PORT = process.env.PORT || 3000
const httpsServer = https.createServer(sslOptions, app)

httpsServer.listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`)
  console.log(`Visit https://localhost:${PORT} to test the API`)
})

module.exports = app
