const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const premisesRoutes = require('./routes/premises')
const campaignsRoutes = require('./routes/campaigns')
const donationsRoutes = require('./routes/donations')

const app = express()

// 1. Clean up origins (removes trailing slashes and spaces)
const frontendUrl = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '')
const allowedOrigins = [
  frontendUrl,
  'http://localhost:3000'
].filter(Boolean)

console.log('CORS allowed origins:', allowedOrigins)

// 2. Simplified CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) 
    // or if the origin is in our allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.error(`CORS Blocked: ${origin} not in ${allowedOrigins}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// 3. CRITICAL: Explicitly handle pre-flight OPTIONS requests
app.options('*', cors(corsOptions))

app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/premises', premisesRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/donations', donationsRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'IHSAN API is running' })
})

const PORT = process.env.PORT || 5000

// Simple start-up
app.listen(PORT, () => {
  console.log(`IHSAN server running on port ${PORT}`)
})
