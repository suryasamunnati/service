const Category = require('../models/Category');

exports.createCategories = async (req, res) => {
  try {
    const categories = Array.isArray(req.body) ? req.body : [req.body];

    // Validate all categories before saving
    categories.forEach(category => {
      if (!category.name || !category.type) {
        throw new Error('Name and type are required for all categories');
      }
      if (!['Service', 'Job'].includes(category.type)) {
        throw new Error('Type must be either "Service" or "Job"');
      }
    });

    const createdCategories = await Category.insertMany(categories);

    res.status(201).json({
      status: 'success',
      data: {
        categories: createdCategories
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    
    res.status(200).json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};