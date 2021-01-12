const express = require('express')
//require('express-async-errors');
const cors = require('cors')
const dotenv = require('dotenv')
const fileUpload = require('express-fileupload')
const errorHandler = require('./middlewares/error')
const connectDB = require('./config/db')

// express app instance
const app = express()

// loading env variables
dotenv.config({ path: './config/config.env' })


// connecting to db
connectDB()

// Body parser
app.use(express.json())

// Enable CORS
app.use(cors())

// file uploader
app.use(fileUpload())

// loading routes
const auth = require('./routes/auth')
const users = require('./routes/users')
const recipes = require('./routes/recipes')

// using routes
app.get('/', (req, res) => {
  res.json('HELLO!')
})
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/recipes', recipes)

// using custom error handler middleware after routes
app.use(errorHandler)


const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))

