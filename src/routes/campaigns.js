const express = require('express')
const router = express.Router()
const {
  createCampaign,
  getActiveCampaigns,
  getNewCampaigns,
  getCompletedCampaigns,
  getCampaign,
  getMyCampaigns,
  updateCampaignStatus
} = require('../controllers/campaignsController')
const { verifyToken, isPremise } = require('../middleware/auth')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ihsan_campaigns',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    upload_preset: 'ihsan_uploads'
  }
})

const upload = multer({ storage })

router.get('/active', getActiveCampaigns)
router.get('/new', getNewCampaigns)
router.get('/completed', getCompletedCampaigns)
router.get('/mine', verifyToken, isPremise, getMyCampaigns)
router.get('/:id', getCampaign)
router.post('/', verifyToken, isPremise, upload.single('image'), createCampaign)
router.patch('/:id/status', verifyToken, isPremise, updateCampaignStatus)

module.exports = router