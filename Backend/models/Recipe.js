// models/Recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  ingredients: [{
    type: String,
    required: [true, 'Ingredients are required'],
    trim: true
  }],
  instructions: {
    type: String,
    required: [true, 'Instructions are required'],
    trim: true,
    maxlength: [2000, 'Instructions cannot be more than 2000 characters']
  },
  cookingTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute']
  },
  difficulty: {
    type: String,
    required: true,
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be Easy, Medium, or Hard'
    },
    default: 'Easy'
  },
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks'],
    default: 'Breakfast'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  },
  likes: {
    type: Number,
    default: 0
  },
  chefTip: {
    type: String,
    maxlength: [200, 'Chef tip cannot be more than 200 characters']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add index for better search performance
recipeSchema.index({ title: 'text', ingredients: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ likes: -1 });
recipeSchema.index({ createdAt: -1 });

// Instance method to check if recipe is popular
recipeSchema.methods.isPopular = function() {
  return this.likes > 50;
};

// Static method to get featured recipes
recipeSchema.statics.getFeatured = function() {
  return this.find({ likes: { $gte: 10 } })
    .sort({ likes: -1, createdAt: -1 })
    .limit(5);
};

// Static method to search recipes
recipeSchema.statics.searchRecipes = function(searchTerm) {
  return this.find({
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { ingredients: { $regex: searchTerm, $options: 'i' } }
    ]
  });
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;