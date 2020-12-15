const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middlewares/auth')
const { getRecipe, getAllRecipes, createRecipe, updateRecipe, deleteRecipe, uploadImg } = require('../controllers/recipes')

router.route('/')
  .get(getAllRecipes)
  .post(protect, authorize('user', 'admin'), createRecipe)

router.route('/:id')
  .get(getRecipe)
  .put(protect, authorize('user', 'admin'), updateRecipe)
  .delete(protect, authorize('user', 'admin'), deleteRecipe)

router.route('/upload')
  .post(protect, authorize('user', 'admin'), uploadImg)

module.exports = router