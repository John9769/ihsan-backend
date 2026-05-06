const express = require('express')
const router = express.Router()
const {
  makeDonation,
  getMyDonations,
  getAllDonations,
  getPlatformEarnings
} = require('../controllers/donationsController')
const { verifyToken, isSuperAdmin, isPremise } = require('../middleware/auth')

router.post('/', makeDonation)
router.get('/mine', verifyToken, isPremise, getMyDonations)
router.get('/all', verifyToken, isSuperAdmin, getAllDonations)
router.get('/earnings', verifyToken, isSuperAdmin, getPlatformEarnings)

module.exports = router