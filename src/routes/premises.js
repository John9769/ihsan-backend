const express = require('express')
const router = express.Router()
const {
  registerPremise,
  getAllPremises,
  updatePremiseStatus,
  bulkImportPremises,
  getPremiseProfile
} = require('../controllers/premisesController')
const { verifyToken, isSuperAdmin } = require('../middleware/auth')

router.post('/register', registerPremise)
router.get('/', verifyToken, isSuperAdmin, getAllPremises)
router.patch('/:id/status', verifyToken, isSuperAdmin, updatePremiseStatus)
router.post('/bulk-import', verifyToken, isSuperAdmin, bulkImportPremises)
router.get('/:id', getPremiseProfile)

module.exports = router