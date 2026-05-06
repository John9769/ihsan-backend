const prisma = require('../lib/prisma')

const PLATFORM_FEE = 0.75
const TOYYIBPAY_FEE = 1.00
const MINIMUM_DONATION = 10.00

// Public - make a donation (DEMO mode)
const makeDonation = async (req, res) => {
  try {
    const { campaign_id, donor_name, donor_phone, donor_email, amount_paid } = req.body

    if (!donor_name || !donor_phone || !amount_paid) {
      return res.status(400).json({ message: 'Name, phone and amount are required' })
    }

    if (parseFloat(amount_paid) < MINIMUM_DONATION) {
      return res.status(400).json({ message: `Minimum donation is RM${MINIMUM_DONATION}` })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(campaign_id) }
    })

    if (!campaign) return res.status(404).json({ message: 'Campaign not found' })
    if (campaign.status !== 'ACTIVE') return res.status(400).json({ message: 'Campaign is no longer active' })

    const amount = parseFloat(amount_paid)
    const net_to_premise = amount - PLATFORM_FEE - TOYYIBPAY_FEE

    const donation = await prisma.donation.create({
      data: {
        campaign_id: parseInt(campaign_id),
        donor_name,
        donor_phone,
        donor_email: donor_email || null,
        amount_paid: amount,
        toyyibpay_fee: TOYYIBPAY_FEE,
        platform_fee: PLATFORM_FEE,
        net_to_premise,
        payment_ref: 'DEMO',
        status: 'SUCCESS'
      }
    })

    // Update campaign collected amount
    await prisma.campaign.update({
      where: { id: parseInt(campaign_id) },
      data: {
        collected_amount: {
          increment: net_to_premise
        }
      }
    })

    // Auto complete campaign if target reached
    const updated = await prisma.campaign.findUnique({ where: { id: parseInt(campaign_id) } })
    if (updated.collected_amount >= updated.target_amount) {
      await prisma.campaign.update({
        where: { id: parseInt(campaign_id) },
        data: { status: 'COMPLETED' }
      })
    }

    res.status(201).json({
      message: 'Donation successful. JazakAllah Khair.',
      donation_id: donation.id,
      amount_paid: amount,
      net_to_premise,
      platform_fee: PLATFORM_FEE,
      toyyibpay_fee: TOYYIBPAY_FEE
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Premise - get donations for own campaigns
const getMyDonations = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { premise_id: req.user.id },
      select: { id: true }
    })

    const campaignIds = campaigns.map(c => c.id)

    const donations = await prisma.donation.findMany({
      where: {
        campaign_id: { in: campaignIds },
        status: 'SUCCESS'
      },
      orderBy: { created_at: 'desc' },
      include: {
        campaign: {
          select: { title: true }
        }
      }
    })

    res.json(donations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Super admin - get all donations
const getAllDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        campaign: {
          select: {
            title: true,
            premise: {
              select: { name: true, type: true, state: true }
            }
          }
        }
      }
    })
    res.json(donations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Super admin - platform earnings summary
const getPlatformEarnings = async (req, res) => {
  try {
    const result = await prisma.donation.aggregate({
      where: { status: 'SUCCESS' },
      _sum: {
        platform_fee: true,
        amount_paid: true,
        net_to_premise: true
      },
      _count: true
    })

    res.json({
      total_transactions: result._count,
      total_collected: result._sum.amount_paid,
      total_to_premises: result._sum.net_to_premise,
      platform_earnings: result._sum.platform_fee
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  makeDonation,
  getMyDonations,
  getAllDonations,
  getPlatformEarnings
}