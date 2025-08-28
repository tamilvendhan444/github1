const express = require('express');
const { protectAdmin, protectStudent } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// @route   GET /api/menu
// @desc    Get all menu items (available only)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, isVeg, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = { isAvailable: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by veg/non-veg
    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const menuItems = await MenuItem.find(query).sort(sortOptions);
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: { menuItems }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items'
    });
  }
});

// @route   GET /api/menu/categories
// @desc    Get all available categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', { isAvailable: true });
    
    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { menuItem }
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item'
    });
  }
});

// @route   POST /api/menu
// @desc    Create menu item
// @access  Private (Admin)
router.post('/', protectAdmin, upload.single('menuImage'), handleUploadError, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isVeg,
      preparationTime,
      ingredients,
      nutritionalInfo
    } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Menu item image is required'
      });
    }

    // Parse arrays and objects from form data
    const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];
    const parsedNutritionalInfo = nutritionalInfo ? JSON.parse(nutritionalInfo) : {};

    const menuItem = await MenuItem.create({
      name,
      description,
      price: parseFloat(price),
      category,
      image: req.file.path.replace(/\\/g, '/'),
      isVeg: isVeg === 'true',
      preparationTime: preparationTime ? parseInt(preparationTime) : 15,
      ingredients: parsedIngredients,
      nutritionalInfo: parsedNutritionalInfo
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: { menuItem }
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private (Admin)
router.put('/:id', protectAdmin, upload.single('menuImage'), handleUploadError, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const {
      name,
      description,
      price,
      category,
      isVeg,
      isAvailable,
      preparationTime,
      ingredients,
      nutritionalInfo
    } = req.body;

    // Update fields
    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    if (isVeg !== undefined) menuItem.isVeg = isVeg === 'true';
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable === 'true';
    if (preparationTime) menuItem.preparationTime = parseInt(preparationTime);
    if (ingredients) menuItem.ingredients = JSON.parse(ingredients);
    if (nutritionalInfo) menuItem.nutritionalInfo = JSON.parse(nutritionalInfo);
    
    // Update image if provided
    if (req.file) {
      menuItem.image = req.file.path.replace(/\\/g, '/');
    }

    await menuItem.save();

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: { menuItem }
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item'
    });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item'
    });
  }
});

// @route   POST /api/menu/:id/review
// @desc    Add review to menu item
// @access  Private (Student)
router.post('/:id/review', protectStudent, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5)'
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Calculate new average rating
    const totalRating = (menuItem.rating * menuItem.reviewCount) + rating;
    menuItem.reviewCount += 1;
    menuItem.rating = totalRating / menuItem.reviewCount;

    await menuItem.save();

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: { 
        rating: menuItem.rating,
        reviewCount: menuItem.reviewCount
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
});

module.exports = router;