// routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// @desc    Get all recipes with filtering and sorting
// @route   GET /api/recipes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = req.query;

    // Build query object
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recipes = await Recipe.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Recipe.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      count: recipes.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      data: recipes
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      data: recipe
    });

  } catch (error) {
    console.error('Get recipe error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Public
router.post('/', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const savedRecipe = await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: savedRecipe
    });

  } catch (error) {
    console.error('Create recipe error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, // Return updated document
        runValidators: true // Run model validations
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe
    });

  } catch (error) {
    console.error('Update recipe error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe deleted successfully',
      data: recipe
    });

  } catch (error) {
    console.error('Delete recipe error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Like a recipe
// @route   POST /api/recipes/:id/like
// @access  Public
router.post('/:id/like', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, // Increment likes by 1
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe liked successfully',
      data: recipe
    });

  } catch (error) {
    console.error('Like recipe error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get featured recipes
// @route   GET /api/recipes/featured/featured
// @access  Public
router.get('/featured/featured', async (req, res) => {
  try {
    const featuredRecipes = await Recipe.getFeatured();
    
    res.json({
      success: true,
      count: featuredRecipes.length,
      data: featuredRecipes
    });

  } catch (error) {
    console.error('Get featured recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get recipe statistics
// @route   GET /api/recipes/stats/stats
// @access  Public
router.get('/stats/stats', async (req, res) => {
  try {
    const stats = await Recipe.aggregate([
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          totalLikes: { $sum: '$likes' },
          avgLikes: { $avg: '$likes' },
          easyRecipes: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] }
          },
          mediumRecipes: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] }
          },
          hardRecipes: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        categories: categoryStats
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;