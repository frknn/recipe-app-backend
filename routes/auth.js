const express = require('express')
const router = express.Router()
const { register, login, getCurrentUser, updateProfile, updatePassword } = require('../controllers/auth')
const { protect, authorize } = require('../middlewares/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, authorize('user', 'admin'), getCurrentUser)
router.put('/updateprofile', protect, authorize('user', 'admin'), updateProfile)
router.put('/updatepassword', protect, authorize('user', 'admin'), updatePassword)

module.exports = router

