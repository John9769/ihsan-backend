const prisma = require('../lib/prisma')

// Premise - create campaign
const createCampaign = async (req, res) => {
  try {
    const { title, purpose, target_amount, start_date, end_date } = req.body
    const image_url = req.file ? req.file.path : null

    const campaign = await prisma.campaign.create({
      data: {
        premise_id: req.user.id,
        title,
        purpose,
        target_amount: parseFloat(target_amount),
        image_url,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: 'ACTIVE'
      }
    })

    res.status(201).json({ message: 'Campaign created', campaign })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Public - get all active campaigns (landing page)
const getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { created_at: 'desc' },
      include: {
        premise: {
          select: { id: true, name: true, type: true, state: true, district: true }
        }
      }
    })
    res.json(campaigns)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Public - get new campaigns (last 7 days)
const getNewCampaigns = async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        created_at: { gte: sevenDaysAgo }
      },
      orderBy: { created_at: 'desc' },
      include: {
        premise: {
          select: { id: true, name: true, type: true, state: true, district: true }
        }
      }
    })
    res.json(campaigns)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Public - get completed campaigns
const getCompletedCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { created_at: 'desc' },
      include: {
        premise: {
          select: { id: true, name: true, type: true, state: true, district: true }
        }
      }
    })
    res.json(campaigns)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Public - get single campaign
const getCampaign = async (req, res) => {
  try {
    const { id } = req.params
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
      include: {
        premise: {
          select: { id: true, name: true, type: true, state: true, district: true, address: true, phone: true }
        },
        donations: {
          where: { status: 'SUCCESS' },
          orderBy: { created_at: 'desc' },
          select: {
            donor_name: true,
            amount_paid: true,
            net_to_premise: true,
            created_at: true
          }
        }
      }
    })
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' })
    res.json(campaign)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Premise - get own campaigns
const getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { premise_id: req.user.id },
      orderBy: { created_at: 'desc' }
    })
    res.json(campaigns)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Premise - update campaign status
const updateCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const campaign = await prisma.campaign.findUnique({ where: { id: parseInt(id) } })
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' })
    if (campaign.premise_id !== req.user.id) return res.status(403).json({ message: 'Not your campaign' })

    const updated = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    res.json({ message: 'Campaign updated', updated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCampaign,
  getActiveCampaigns,
  getNewCampaigns,
  getCompletedCampaigns,
  getCampaign,
  getMyCampaigns,
  updateCampaignStatus
}