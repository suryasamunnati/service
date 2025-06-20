const Service = require('../models/Service');
const Category = require('../models/Category');
const Subscription = require('../models/Subscription');

exports.createService = async (req, res) => {
  try {
    const { categoryPrices, location, isCompanyPost, companyId } = req.body;

    // Verify categoryPrices exist and are properly formatted
    if (!categoryPrices || !Array.isArray(categoryPrices) || categoryPrices.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one category with price is required'
      });
    }

    // Extract category IDs from categoryPrices
    const categoriesIds = categoryPrices.map(item => item.category);

    // Verify all categories exist and are of type 'Service'
    const categories = await Category.find({
      _id: { $in: categoriesIds },
      type: 'Service'
    });

    if (categories.length !== categoriesIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more categories are invalid or not of type Service'
      });
    }

    // Check user's subscription status and free post usage
    const userSubscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    const servicePostSub = userSubscriptions.find(sub => sub.type === 'SERVICE_POST');
    const existingServicePosts = await Service.countDocuments({ user: req.user._id });

    if (!servicePostSub && existingServicePosts >= 1) {
      return res.status(403).json({
        status: 'error',
        message: 'You have used your free service post. Please subscribe to Service Post plan to post more services',
        subscriptionRequired: true,
        subscriptionType: 'SERVICE_POST'
      });
    }

    const service = await Service.create({
      categories: categoriesIds,
      categoryPrices,
      location,
      isCompanyPost,
      companyId,
      user: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ user: req.user._id })
      .populate('categoryPrices.category')
      .populate('user', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    // Check if user has valid subscription for service search
    const userSubscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    const canSearchServices = userSubscriptions.some(sub => 
      ['SERVICE_SEARCH', 'SERVICE_POST'].includes(sub.type)
    );

    if (!canSearchServices) {
      return res.status(403).json({
        status: 'error',
        message: 'Please subscribe to search services',
        subscriptionRequired: true
      });
    }

    const services = await Service.find()
      .populate('categoryPrices.category')
      .populate('user', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    // Check if user has valid subscription for service search
    const userSubscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    const canSearchServices = userSubscriptions.some(sub => 
      ['SERVICE_SEARCH', 'SERVICE_POST'].includes(sub.type)
    );

    if (!canSearchServices) {
      return res.status(403).json({
        status: 'error',
        message: 'Please subscribe to search services',
        subscriptionRequired: true
      });
    }

    const service = await Service.findById(req.params.id)
      .populate('categoryPrices.category')
      .populate('user', 'name email phone');

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};


exports.searchServicesByKeyword = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Keyword is required for service search'
      });
    }

    // Check if user has valid subscription for service search
    const userSubscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    const canSearchServices = userSubscriptions.some(sub =>
      ['SERVICE_SEARCH', 'SERVICE_POST'].includes(sub.type)
    );

    if (!canSearchServices) {
      return res.status(403).json({
        status: 'error',
        message: 'Please subscribe to search services',
        subscriptionRequired: true
      });
    }

    // Find matching categories (type = Service)
    const matchingCategories = await Category.find({
      type: 'Service',
      name: new RegExp(keyword, 'i')
    }).select('_id');

    // Only search services that match the category
    const services = await Service.find({
      'categoryPrices.category': { $in: matchingCategories.map(cat => cat._id) }
    })
    .populate('categoryPrices.category')
    .populate('user', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
