const mongoose = require('mongoose')

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  prepTime: {
    type: Number,
    required: [true, 'Please add preperation time']
  },
  cookTime: {
    type: Number,
    required: [true, 'Please add cook time']
  },
  ingredients: {
    type: [String],
    required: [true, 'Please add ingredients']
  },
  coverPhoto: {
    type: String,
    // required: [true, 'Please provide a cover photo']
  },
  recipeSteps: {
    type: [String],
    required: [true, 'Please add recipe steps']
  },
  category: {
    type: String,
    required: [true, 'Please add category']
  },
  amount: {
    type: Number,
    min: 1
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
})

module.exports = mongoose.model('Recipe', RecipeSchema)