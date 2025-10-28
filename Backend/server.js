const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// CORS for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-recipe-finder.netlify.app',
    'https://your-recipe-finder-app.netlify.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas Connected!');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

connectDB();

// Your existing recipe schema and routes...
const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  cookingTime: { type: Number, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  category: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks'],
    default: 'Breakfast'
  },
  image: { type: String },
  likes: { type: Number, default: 0 },
  chefTip: { type: String }
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// API Routes (keep your existing routes)
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json({ success: true, count: recipes.length, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching recipes', error: error.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const savedRecipe = await recipe.save();
    res.status(201).json({ success: true, message: 'Recipe created!', data: savedRecipe });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating recipe', error: error.message });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, message: 'Recipe updated!', data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating recipe', error: error.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, message: 'Recipe deleted!', data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting recipe', error: error.message });
  }
});

app.post('/api/recipes/:id/like', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, message: 'Recipe liked!', data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error liking recipe', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🍳 Recipe Finder API is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🍳 Recipe Finder API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      recipes: 'GET /api/recipes',
      createRecipe: 'POST /api/recipes',
      updateRecipe: 'PUT /api/recipes/:id',
      deleteRecipe: 'DELETE /api/recipes/:id',
      likeRecipe: 'POST /api/recipes/:id/like'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});