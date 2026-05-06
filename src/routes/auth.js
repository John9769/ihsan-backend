const express = require('express')
const router = express.Router()
const { seedAdmin, adminLogin, premiseLogin } = require('../controllers/authController')

router.post('/seed', seedAdmin)
router.post('/admin/login', adminLogin)
router.post('/premise/login', premiseLogin)

module.exports = router