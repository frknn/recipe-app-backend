const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ErrorResponse = require("../utils/ErrorResponse")

const protect = async (req, res, next) => {

  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1]
    }

    // Set token from cookie
    //else if (req.cookies.token) {
    //  token = req.cookies.token
    //}

    // Make sure token exists
    if (!token) {
      throw new ErrorResponse('Not authorized to access this route', 401)
    }

    // Verify token
    // Example token --> { id: 1, iat: xxx, exp: date }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    req.user = await User.findById(decoded.id)

    next()
  } catch (error) {
    next(error)
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      throw new ErrorResponse(`<${req.user.role}> role is not authorized to access this route`, 403)
    }
    next()
  }
}

module.exports = {
  protect,
  authorize
}