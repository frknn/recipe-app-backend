const Recipe = require('../models/Recipe')
const ErrorResponse = require('../utils/ErrorResponse')

const getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
    if (!recipe) {
      throw new ErrorResponse('No recipe found with given id', 404)
    }
    res.status(200).json({
      success: true,
      data: recipe
    })
  } catch (error) {
    next(error)
  }
}

const getAllRecipes = async (req, res, next) => {
  try {
    console.log('QUERY: ', req.query)

    let queryObject = {}

    Object.keys(req.query).forEach(k => {
      if (k === 'ingredients') {
        queryObject[k] = { $all: req.query[k].split(',') }
      } else if (k === 'prepTime') {
        queryObject[k] = { $lte: req.query[k] }
      } else if (k === 'cookTime') {
        queryObject[k] = { $lte: req.query[k] }
      } else if (k === 'category') {
        queryObject[k] = req.query[k]
      }
    })

    console.log('BUILT QUERY OBJECT: ', queryObject)

    const recipes = await Recipe.find(queryObject)

    res.status(200).json({
      success: true,
      data: recipes
    })
  } catch (error) {
    next(error)
  }
}

const createRecipe = async (req, res, next) => {
  try {
    // Add user(objectId) to req.body
    req.body.owner = req.user.id;

    const recipe = await Recipe.create(req.body)

    res.status(200).json({
      success: true,
      data: recipe
    })
  } catch (error) {
    next(error)
  }
}

const updateRecipe = async (req, res, next) => {
  try {
    let fieldsNotAllowedToUpdate = ['ingredients', 'coverPhoto']
    let recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      throw new ErrorResponse('No recipe found with given id', 404)
    }

    if (req.user.role !== 'admin' && recipe.owner.toString() !== req.user.id.toString()) {
      throw new ErrorResponse("Users are not allowed to update other users' recipes", 403)
    }

    Object.keys(req.body).forEach(key => {
      if (fieldsNotAllowedToUpdate.includes(key)) {
        throw new ErrorResponse(`Attempted to update a forbidden field: <${key}>`, 403)
      }
    })

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: recipe
    })

  } catch (error) {
    next(error)
  }
}

const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      throw new ErrorResponse('No recipe found with given id', 404)
    }

    if (req.user.role !== 'admin' && recipe.owner.toString() !== req.user.id.toString()) {
      throw new ErrorResponse("Users are not allowed to delete other users' recipes", 403)
    }

    const removedRecipe = await recipe.remove()

    res.status(200).json({
      success: true,
      message: 'Recipe removed successfully',
      removedRecipe
    })

  } catch (error) {
    next(error)
  }
}

module.exports = {
  getRecipe,
  getAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe
}