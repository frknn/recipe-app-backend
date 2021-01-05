const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middlewares/auth')
const { getAllUsers, getSingleUser, deleteUser, updateUser, addRecipeToFavorites } = require('../controllers/users')

router.get('/', protect, authorize('user', 'admin'), getAllUsers)
router.get('/:id', getSingleUser)
router.post('/add-recipe-to-favorites', protect, addRecipeToFavorites)
router.put('/:id', protect, updateUser)
router.delete('/:id', protect, authorize('user', 'admin'), deleteUser)

module.exports = router