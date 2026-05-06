const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

// Super admin seed - run once to create admin account
const seedAdmin = async (req, res) => {
  try {
    const existing = await prisma.user.findFirst()
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' })
    }
    const hash = await bcrypt.hash('ihsan@admin2026', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@ihsan.my',
        password_hash: hash,
        role: 'SUPER_ADMIN'
      }
    })
    res.json({ message: 'Admin created', email: admin.email })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Super admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid password' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, role: user.role, email: user.email })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Premise login
const premiseLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const premise = await prisma.premise.findUnique({ where: { email } })
    if (!premise) return res.status(404).json({ message: 'Premise not found' })

    if (premise.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account pending approval' })
    }

    const valid = await bcrypt.compare(password, premise.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid password' })

    const token = jwt.sign(
      { id: premise.id, email: premise.email, role: 'PREMISE' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, role: 'PREMISE', email: premise.email, name: premise.name })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { seedAdmin, adminLogin, premiseLogin }