const User = require('../models/User')
const { use } = require('../routes/users')
const ErrorResponse = require('../utils/ErrorResponse')

const getAllUsers = async (req, res, next) => {

  try {
    const users = await User.find().populate('recipes').populate('recipesSaved')
    res.status(200).json({
      success: true,
      data: users
    })
  } catch (error) {
    next(error)
  }
}

const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('recipes').populate('recipesSaved')
    if (!user) {
      throw new ErrorResponse('No user found with given id', 404)
    }
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    if (req.user._id != req.params.id) {
      throw new ErrorResponse('Not authorized to update another user!', 401)
    }

    let user = await User.findById(req.params.id)

    if (!user) {
      throw new ErrorResponse('No user found with given id', 404)
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

const addRecipeToFavorites = async (req, res, next) => {
  try {
    console.log('backend controller çalıştı')
    const { recipeId } = req.body
    let user = await User.findById(req.user._id).populate('recipes')
    const favoritedByUser = user.recipesSaved.some(r => {
      console.log(r)
      console.log(recipeId)
      console.log(r == recipeId)
      return r == recipeId
    }
    )
    console.log('FAV BY USER', favoritedByUser)
    if (favoritedByUser) {
      console.log('IF')
      user.recipesSaved = user.recipesSaved.filter(r => r != recipeId)
    } else {
      console.log('ELSE')
      user.recipesSaved.push(recipeId)
    }

    user = await user.save()

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    // If user is not admin and tries to delete another user, reject the request
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      throw new ErrorResponse('Users can only delete their own accounts', 403)
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      throw new ErrorResponse('No user found with given id', 404)
    }

    const removedUser = await user.remove()

    res.status(200).json({
      success: true,
      message: 'User removed successfully',
      removedUser
    })

  } catch (error) {
    next(error)
  }

}

module.exports = {
  getAllUsers,
  getSingleUser,
  addRecipeToFavorites,
  updateUser,
  deleteUser
}