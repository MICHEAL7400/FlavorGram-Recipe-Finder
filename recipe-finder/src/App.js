// App.js - SWEET Recipe Finder with Image Uploads & Details
import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    cookingTime: '',
    difficulty: 'Easy',
    category: 'Breakfast',
    image: null,
    imagePreview: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or detail

  // 🔥 Hero Section Slides
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2060&q=80',
      title: 'Share Your Culinary Masterpieces',
      subtitle: 'Upload photos and inspire other food lovers',
      emoji: '📸'
    },
    {
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=2060&q=80',
      title: 'Visual Recipe Stories',
      subtitle: 'Every picture tells a delicious story',
      emoji: '🍽️'
    },
    {
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=2031&q=80',
      title: 'Colorful Food Journey',
      subtitle: 'Make your recipes pop with amazing photos',
      emoji: '🌈'
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Fetch recipes from backend
  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes`);
      const result = await response.json();
      
      if (result.success) {
        setRecipes(result.data);
        if (result.data.length > 0) {
          setFeaturedRecipe(result.data[0]);
        }
      } else {
        // Fallback to sample recipes if backend fails
        setRecipes(sampleRecipes);
        setFeaturedRecipe(sampleRecipes[0]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      // Fallback to sample recipes
      setRecipes(sampleRecipes);
      setFeaturedRecipe(sampleRecipes[0]);
    }
  };

  // Sample recipes with BEAUTIFUL images (fallback)
  const sampleRecipes = [
    {
      _id: '1',
      title: '🌈 Rainbow Buddha Bowl',
      ingredients: ['Quinoa', 'Avocado', 'Cherry tomatoes', 'Purple cabbage', 'Carrots', 'Edamame', 'Tahini dressing'],
      instructions: '1. Cook quinoa according to package instructions. 2. Chop all vegetables into colorful pieces. 3. Arrange in a bowl like a rainbow. 4. Drizzle with tahini dressing. 5. Enjoy this vibrant, healthy meal! 🌈',
      cookingTime: 20,
      difficulty: 'Easy',
      category: 'Lunch',
      likes: 89,
      chefTip: 'Add pomegranate seeds for extra color and crunch!',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      createdAt: new Date('2024-01-15')
    },
    {
      _id: '2',
      title: '🍫 Decadent Chocolate Lava Cake',
      ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Cocoa powder', 'Vanilla ice cream'],
      instructions: '1. Melt chocolate and butter together. 2. Whisk eggs and sugar until pale. 3. Fold in chocolate mixture and flour. 4. Bake at 200°C for 12 minutes. 5. Serve immediately with ice cream! 🍨',
      cookingTime: 25,
      difficulty: 'Medium',
      category: 'Dessert',
      likes: 156,
      chefTip: 'Underbake by 1 minute for the perfect lava flow!',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      createdAt: new Date('2024-01-10')
    },
    {
      _id: '3',
      title: '🌮 Street-Style Fish Tacos',
      ingredients: ['White fish fillets', 'Corn tortillas', 'Cabbage slaw', 'Lime crema', 'Avocado', 'Cilantro', 'Lime wedges'],
      instructions: '1. Season fish with spices and pan-fry until crispy. 2. Warm tortillas. 3. Make slaw with cabbage and lime. 4. Assemble tacos with fish, slaw, and crema. 5. Top with avocado and cilantro! 🎉',
      cookingTime: 30,
      difficulty: 'Easy',
      category: 'Dinner',
      likes: 112,
      chefTip: 'Double-fry the fish for extra crispiness!',
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      createdAt: new Date('2024-01-08')
    }
  ];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks'];

  // 🖼️ Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const recipeData = {
      title: formData.title,
      ingredients: formData.ingredients.split(',').map(item => item.trim()),
      instructions: formData.instructions,
      cookingTime: parseInt(formData.cookingTime),
      difficulty: formData.difficulty,
      category: formData.category,
      chefTip: formData.chefTip || 'Pro tip: Share your secret ingredient! 🤫',
      image: formData.imagePreview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
    };

    try {
      if (editingId) {
        // Update existing recipe
        const response = await fetch(`${API_BASE_URL}/api/recipes/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recipeData),
        });
        const result = await response.json();
        
        if (result.success) {
          alert('Recipe updated successfully! ✨');
          fetchRecipes();
        }
      } else {
        // Create new recipe
        const response = await fetch(`${API_BASE_URL}/api/recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recipeData),
        });
        const result = await response.json();
        
        if (result.success) {
          alert('Recipe published successfully! 🎉');
          fetchRecipes();
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving recipe:', error);
      // Fallback to local state if API fails
      const newRecipe = {
        _id: Date.now().toString(),
        ...recipeData,
        likes: 0,
        createdAt: new Date()
      };

      if (editingId) {
        setRecipes(recipes.map(recipe => 
          recipe._id === editingId ? { ...newRecipe, _id: editingId } : recipe
        ));
        alert('Recipe updated successfully! ✨');
      } else {
        setRecipes([newRecipe, ...recipes]);
        alert('Recipe published successfully! 🎉');
      }
      resetForm();
    }
  };

  const handleEdit = (recipe) => {
    setFormData({
      title: recipe.title,
      ingredients: recipe.ingredients.join(', '),
      instructions: recipe.instructions,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      category: recipe.category,
      chefTip: recipe.chefTip,
      image: null,
      imagePreview: recipe.image
    });
    setEditingId(recipe._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this delicious masterpiece? 😢')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        
        if (result.success) {
          alert('Recipe deleted successfully! 🗑️');
          fetchRecipes();
        }
      } catch (error) {
        console.error('Error deleting recipe:', error);
        // Fallback to local state if API fails
        setRecipes(recipes.filter(recipe => recipe._id !== id));
        if (selectedRecipe && selectedRecipe._id === id) {
          setSelectedRecipe(null);
          setViewMode('grid');
        }
        alert('Recipe deleted successfully! 🗑️');
      }
    }
  };

  const handleLike = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${id}/like`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        fetchRecipes();
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
      // Fallback to local state if API fails
      setRecipes(recipes.map(recipe =>
        recipe._id === id ? { ...recipe, likes: recipe.likes + 1 } : recipe
      ));
      if (selectedRecipe && selectedRecipe._id === id) {
        setSelectedRecipe(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      ingredients: '',
      instructions: '',
      cookingTime: '',
      difficulty: 'Easy',
      category: 'Breakfast',
      chefTip: '',
      image: null,
      imagePreview: ''
    });
    setEditingId(null);
  };

  // 👁️ View Recipe Details
  const viewRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
    setViewMode('detail');
  };

  // ↩️ Back to Grid View
  const backToGrid = () => {
    setSelectedRecipe(null);
    setViewMode('grid');
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getTrendingRecipes = () => {
    return [...recipes].sort((a, b) => b.likes - a.likes).slice(0, 3);
  };

  const getDifficultyEmoji = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '😎';
      case 'Medium': return '💪';
      case 'Hard': return '🔥';
      default: return '👨‍🍳';
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Breakfast': '🥞',
      'Lunch': '🥪',
      'Dinner': '🍽️',
      'Dessert': '🍰',
      'Snacks': '🍿',
      'Drinks': '🥤',
      'All': '🌟'
    };
    return emojis[category] || '👨‍🍳';
  };

  // 🎨 Detail View Component
  const RecipeDetailView = ({ recipe, onBack, onLike, onEdit, onDelete }) => (
    <div className="recipe-detail-view">
      <button className="back-button" onClick={onBack}>
        ← Back to Recipes
      </button>
      
      <div className="detail-hero">
        <img src={recipe.image} alt={recipe.title} className="detail-image" />
        <div className="detail-hero-content">
          <h1>{recipe.title}</h1>
          <div className="detail-meta">
            <span className="detail-category">{getCategoryEmoji(recipe.category)} {recipe.category}</span>
            <span className="detail-difficulty">{getDifficultyEmoji(recipe.difficulty)} {recipe.difficulty}</span>
            <span className="detail-time">⏱️ {recipe.cookingTime} minutes</span>
            <span className="detail-likes">❤️ {recipe.likes} likes</span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>🎯 What You'll Need</h2>
          <div className="ingredients-grid">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-card">
                <span className="ingredient-emoji">✨</span>
                <span>{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h2>👨‍🍳 Cooking Instructions</h2>
          <div className="instructions-steps">
            {recipe.instructions.split('\n').map((step, index) => (
              <div key={index} className="instruction-step">
                <div className="step-number">{index + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {recipe.chefTip && (
          <div className="detail-section chef-tip-section">
            <h2>💫 Pro Chef Tip</h2>
            <div className="chef-tip-card">
              <span className="tip-emoji">👑</span>
              <p>{recipe.chefTip}</p>
            </div>
          </div>
        )}

        <div className="detail-actions">
          <button className="btn btn-primary" onClick={() => onLike(recipe._id)}>
            ❤️ Like This Recipe
          </button>
          <button className="btn btn-edit" onClick={() => onEdit(recipe)}>
            ✏️ Edit Recipe
          </button>
          <button className="btn btn-delete" onClick={() => onDelete(recipe._id)}>
            🗑️ Delete Recipe
          </button>
        </div>
      </div>
    </div>
  );

  // If in detail view, show the detail component
  if (viewMode === 'detail' && selectedRecipe) {
    return (
      <RecipeDetailView
        recipe={selectedRecipe}
        onBack={backToGrid}
        onLike={handleLike}
        onEdit={(recipe) => {
          handleEdit(recipe);
          backToGrid();
        }}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="App">
      {/* 🎭 Hero Section */}
      <section className="hero-section">
        <div className="hero-slides">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <span className="hero-emoji">{slide.emoji}</span>
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                <div className="hero-buttons">
                  <button className="btn btn-primary" onClick={() => document.getElementById('recipes-section').scrollIntoView({ behavior: 'smooth' })}>
                    Explore Recipes 🍳
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="slide-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <div className="scroll-indicator" onClick={() => document.getElementById('recipes-section').scrollIntoView({ behavior: 'smooth' })}>
          <span>👇</span>
          <p>Discover Amazing Recipes</p>
        </div>
      </section>

      {/* 🔥 Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1>
              <span className="fire-emoji">📸</span>
              FlavorGram
              <span className="sparkle-emoji">🎨</span>
            </h1>
            <p className="tagline">Where every recipe tells a colorful story! 🌈</p>
          </div>
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-number">{recipes.length}</span>
              <span className="stat-label">Recipes</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {recipes.reduce((total, recipe) => total + recipe.likes, 0)}
              </span>
              <span className="stat-label">Foodie Likes</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {recipes.filter(r => r.difficulty === 'Easy').length}
              </span>
              <span className="stat-label">Quick Wins</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* 🎯 Featured Recipe */}
        {featuredRecipe && (
          <div className="featured-section">
            <div className="featured-badge">🌟 FEATURED CREATION</div>
            <div className="featured-recipe">
              <div className="featured-image">
                <img src={featuredRecipe.image} alt={featuredRecipe.title} />
                <div className="image-overlay">
                  <button className="btn btn-featured" onClick={() => viewRecipeDetails(featuredRecipe)}>
                    👀 View Details
                  </button>
                </div>
              </div>
              <div className="featured-content">
                <h2>{featuredRecipe.title}</h2>
                <p className="featured-description">{featuredRecipe.instructions.split('\n')[0]}</p>
                <div className="featured-meta">
                  <span className="time">⏱️ {featuredRecipe.cookingTime}min</span>
                  <span className="difficulty">{getDifficultyEmoji(featuredRecipe.difficulty)} {featuredRecipe.difficulty}</span>
                  <span className="likes">❤️ {featuredRecipe.likes} likes</span>
                </div>
                <button className="btn btn-primary" onClick={() => viewRecipeDetails(featuredRecipe)}>
                  🍽️ Cook This Masterpiece
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🎛️ Controls Section */}
        <div className="controls-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search for recipes or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="categories-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {getCategoryEmoji(category)} {category}
              </button>
            ))}
          </div>
        </div>

        <div className="main-content">
          {/* 📝 Recipe Form with Image Upload */}
          <div className="form-section">
            <div className="form-header">
              <h2>{editingId ? '✏️ Edit Your Masterpiece' : '🎨 Create New Recipe'}</h2>
              <div className="form-badge">{editingId ? 'Editing Mode' : 'Create Mode'}</div>
            </div>
            
            <form onSubmit={handleSubmit} className="recipe-form">
              {/* 🖼️ Image Upload Section */}
              <div className="image-upload-section">
                <div className="upload-area">
                  {formData.imagePreview ? (
                    <div className="image-preview">
                      <img src={formData.imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="change-image-btn"
                        onClick={() => document.getElementById('image-upload').click()}
                      >
                        📸 Change Image
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="upload-placeholder"
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <div className="upload-icon">📸</div>
                      <p>Click to upload your food masterpiece</p>
                      <small>Make it look delicious! 🍔</small>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>🎯 Recipe Name</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Give it a fire name..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>📦 Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>
                        {getCategoryEmoji(category)} {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>⚡ Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option value="Easy">😎 Easy</option>
                    <option value="Medium">💪 Medium</option>
                    <option value="Hard">🔥 Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>⏱️ Cook Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.cookingTime}
                    onChange={(e) => setFormData({...formData, cookingTime: e.target.value})}
                    placeholder="How long to flex?"
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>🛒 Ingredients (separate with commas)</label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  placeholder="avocado, bread, magic dust... ✨"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>📖 Instructions (one step per line)</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Step 1: Do this...
Step 2: Then that...
Step 3: Enjoy! 🎉"
                  required
                  rows="4"
                />
              </div>

              <div className="form-group full-width">
                <label>💫 Chef's Secret Tip (optional)</label>
                <input
                  type="text"
                  value={formData.chefTip}
                  onChange={(e) => setFormData({...formData, chefTip: e.target.value})}
                  placeholder="Share your secret ingredient or technique..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? '🔄 Update Recipe' : '🚀 Publish Recipe'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    ❌ Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 📊 Trending Sidebar */}
          <div className="sidebar">
            <div className="trending-section">
              <h3>🔥 Trending Now</h3>
              {getTrendingRecipes().map((recipe, index) => (
                <div key={recipe._id} className="trending-item" onClick={() => viewRecipeDetails(recipe)}>
                  <div className="trending-image">
                    <img src={recipe.image} alt={recipe.title} />
                  </div>
                  <div className="trending-content">
                    <h4>{recipe.title}</h4>
                    <div className="trending-meta">
                      <span>❤️ {recipe.likes}</span>
                    </div>
                  </div>
                  <div className="trending-rank">#{index + 1}</div>
                </div>
              ))}
            </div>

            <div className="quick-stats">
              <h3>📈 Kitchen Stats</h3>
              <div className="stat-item">
                <span>Total Recipes:</span>
                <span className="stat-value">{recipes.length}</span>
              </div>
              <div className="stat-item">
                <span>Most Popular Category:</span>
                <span className="stat-value">
                  {recipes.length ? 
                    Object.entries(recipes.reduce((acc, r) => {
                      acc[r.category] = (acc[r.category] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0][0] : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🍽️ Recipes Grid */}
        <div id="recipes-section" className="recipes-section">
          <div className="section-header">
            <h2>
              {activeCategory === 'All' ? '🍽️ All Recipes' : `${getCategoryEmoji(activeCategory)} ${activeCategory} Recipes`}
              <span className="recipe-count">({filteredRecipes.length})</span>
            </h2>
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🍳</div>
              <h3>No recipes found!</h3>
              <p>Be the first to create something amazing! 👆</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {filteredRecipes.map(recipe => (
                <div key={recipe._id} className="recipe-card">
                  <div className="card-image">
                    <img src={recipe.image} alt={recipe.title} />
                    <div className="image-overlay">
                      <button className="view-details-btn" onClick={() => viewRecipeDetails(recipe)}>
                        👀 View Details
                      </button>
                      <button className="like-btn" onClick={() => handleLike(recipe._id)}>
                        ❤️ {recipe.likes}
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-header">
                      <h3>{recipe.title}</h3>
                      <span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>
                        {getDifficultyEmoji(recipe.difficulty)}
                      </span>
                    </div>
                    
                    <div className="recipe-meta">
                      <span>⏱️ {recipe.cookingTime}min</span>
                      <span>{getCategoryEmoji(recipe.category)}</span>
                    </div>

                    <p className="recipe-description">
                      {recipe.instructions.split('\n')[0].slice(0, 100)}...
                    </p>

                    <div className="recipe-actions">
                      <button className="btn btn-primary" onClick={() => viewRecipeDetails(recipe)}>
                        👁️ View Details
                      </button>
                      <button className="btn btn-edit" onClick={() => handleEdit(recipe)}>
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;