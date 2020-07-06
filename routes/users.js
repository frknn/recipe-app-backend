const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middlewares/auth')
const { getAllUsers, getSingleUser, deleteUser } = require('../controllers/users')

router.get('/', protect,  authorize('user','admin'), getAllUsers)
router.get('/:id', protect, authorize('admin'), getSingleUser)
router.delete('/:id', protect, authorize('user', 'admin'), deleteUser)

module.exports = router