const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const authRoutes = require('./routes/auth')
const premisesRoutes = require('./routes/premises')
const campaignsRoutes = require('./routes/campaigns')
const donationsRoutes = require('./routes/donations')

const app = express()

const allowedOrigins = [
  (process.env.FRONTEND_URL || '').trim(),
  'http://localhost:3000'
].filter(Boolean)

console.log('CORS allowed origins:', allowedOrigins)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS BLOCKED:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/premises', premisesRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/donations', donationsRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'IHSAN API is running' })
})

module.exports = app