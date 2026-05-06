const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const premisesRoutes = require('./routes/premises')
const campaignsRoutes = require('./routes/campaigns')
const donationsRoutes = require('./routes/donations')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

const PORT = process.env.PORT || 5000

const safeLoad = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`IHSAN server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

safeLoad()