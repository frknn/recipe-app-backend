const User = require('../models/User')
const ErrorResponse = require('../utils/ErrorResponse')

const register = async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    user.password = undefined
    res.status(200).json({
      success: true,
      message: 'You have successfully registered',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  let { email, password } = req.body

  console.log(email, " - ", password)
  try {

    // Make sure that email and password exist
    if (!email || !password) {
      throw new ErrorResponse('Please provide an email and password', 400)
    }

    // Check if user with given email exists
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw new ErrorResponse('Invalid credentials', 401)
    }


    // Check if given password matches with users password
    const match = await user.isPwMatch(password)
    if (!match) {
      throw new ErrorResponse('Invalid credentials', 401)
    }
    const token = user.getSignedJwtToken()

    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    }

    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user
      })
  } catch (error) {
    next(error)
  }
}

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      data: user
    })

  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const fieldsAllowedToUpdate = ['name', 'lastName']

    Object.keys(req.body).forEach(key => {
      if (!fieldsAllowedToUpdate.includes(key)) {
        throw new ErrorResponse(`Attempted to update a forbidden field: <${key}>`, 403)
      }
    })

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
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

const updatePassword = async (req, res, next) => {

  try {
    const user = await User.findById(req.user.id).select('+password')

    // Check if current password matches
    const match = await user.isPwMatch(req.body.currentPassword)
    if (!match) {
      throw new ErrorResponse('Wrong current password!', 401)
    }

    // If current password check, set the password to new password
    user.password = req.body.newPassword

    // update pw and return user
    const updatedUser = await user.save()

    // generate new token for new updatedUser
    const token = updatedUser.getSignedJwtToken()

    const optipns = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true
    }

    res.status(200)
      .cookie('token', token, optipns)
      .json({
        success: true,
        token
      })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  updatePassword
}