const bcrypt = require('bcryptjs')
const prisma = require('../lib/prisma')

// Public - register a new premise
const registerPremise = async (req, res) => {
  try {
    const {
      type, name, registration_no, state, district,
      address, phone, email, password,
      bank_name, bank_account_no, bank_account_name
    } = req.body

    const existing = await prisma.premise.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)

    const premise = await prisma.premise.create({
      data: {
        type, name, registration_no, state, district,
        address, phone, email,
        password_hash: hash,
        bank_name, bank_account_no, bank_account_name,
        status: 'PENDING'
      }
    })

    res.status(201).json({ message: 'Registration submitted. Awaiting approval.', id: premise.id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Super admin - get all premises
const getAllPremises = async (req, res) => {
  try {
    const premises = await prisma.premise.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true, type: true, name: true, registration_no: true,
        state: true, district: true, address: true,
        phone: true, email: true, bank_name: true,
        bank_account_no: true, bank_account_name: true,
        status: true, created_at: true
      }
    })
    res.json(premises)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Super admin - approve or suspend premise
const updatePremiseStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const premise = await prisma.premise.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    res.json({ message: `Premise status updated to ${status}`, premise })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Super admin - bulk import premises from director list
const bulkImportPremises = async (req, res) => {
  try {
    const { premises } = req.body

    if (!premises || !Array.isArray(premises)) {
      return res.status(400).json({ message: 'Invalid data. Expected array of premises.' })
    }

    const results = []
    const errors = []

    for (const p of premises) {
      try {
        const existing = await prisma.premise.findUnique({ where: { email: p.email } })
        if (existing) {
          errors.push({ name: p.name, reason: 'Email already exists' })
          continue
        }
        const hash = await bcrypt.hash(p.password || 'ihsan@2026', 10)
        const created = await prisma.premise.create({
          data: {
            type: p.type,
            name: p.name,
            registration_no: p.registration_no || '-',
            state: p.state,
            district: p.district,
            address: p.address || '-',
            phone: p.phone || '-',
            email: p.email,
            password_hash: hash,
            bank_name: p.bank_name || '-',
            bank_account_no: p.bank_account_no || '-',
            bank_account_name: p.bank_account_name || '-',
            status: 'ACTIVE'
          }
        })
        results.push(created.name)
      } catch (e) {
        errors.push({ name: p.name, reason: e.message })
      }
    }

    res.json({
      message: `Imported ${results.length} premises. ${errors.length} failed.`,
      imported: results,
      errors
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Public - get single premise profile
const getPremiseProfile = async (req, res) => {
  try {
    const { id } = req.params
    const premise = await prisma.premise.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true, type: true, name: true, state: true,
        district: true, address: true, phone: true,
        status: true, created_at: true,
        campaigns: {
          where: { status: 'ACTIVE' },
          orderBy: { created_at: 'desc' }
        }
      }
    })
    if (!premise) return res.status(404).json({ message: 'Premise not found' })
    res.json(premise)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  registerPremise,
  getAllPremises,
  updatePremiseStatus,
  bulkImportPremises,
  getPremiseProfile
}