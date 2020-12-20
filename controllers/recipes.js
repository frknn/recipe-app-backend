const Recipe = require('../models/Recipe')
const ErrorResponse = require('../utils/ErrorResponse')
const cloudinary = require('cloudinary').v2

const getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('owner')
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
      }
      if (k === 'prepTime') {
        queryObject[k] = { $lte: req.query[k] }
      }
      if (k === 'cookTime') {
        queryObject[k] = { $lte: req.query[k] }
      }
      if (k === 'category') {
        queryObject[k] = req.query[k]
      }
      if (k === 'title') {
        queryObject[k] = { $regex: req.query[k], $options: 'i' }
      }
    })

    console.log('BUILT QUERY OBJECT: ', queryObject)

    const recipes = await Recipe.find(queryObject).populate('owner')

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

    // create model, save then populate user info
    const recipeObject = new Recipe(req.body)
    const savedRecipe = await recipeObject.save()
    const populatedRecipe = await savedRecipe.populate('owner').execPopulate()

    res.status(200).json({
      success: true,
      data: populatedRecipe
    })
  } catch (error) {
    next(error)
  }
}

const updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      throw new ErrorResponse('No recipe found with given id', 404)
    }

    if (req.user.role !== 'admin' && recipe.owner.toString() !== req.user.id.toString()) {
      throw new ErrorResponse("Users are not allowed to update other users' recipes", 403)
    }

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

const uploadImg = async (req, res, next) => {
  try {
    if (req.files === null) {
      throw new ErrorResponse('Resim yüklenmedi!', 400)
    }

    const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg']

    const file = req.files.file
    console.log('File mimetype: ', file.mimetype)
    if (!allowedFileTypes.includes(file.mimetype)) {
      throw new ErrorResponse('You can only upload PNG, JPG or JPEG.', 400)
    }

    const imgPath = `${process.cwd()}/public/images/${file.name}`
    file.mv(imgPath, err => {
      if (err) {
        console.log('ERRRRRROR:', err)
        throw new ErrorResponse('bruh', 500)
      }
    })

    const image = await cloudinary.uploader.upload(imgPath)

    res.status(200).json({
      imgUrl: image.url
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
  deleteRecipe,
  uploadImg
}