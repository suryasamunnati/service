const Job = require('../models/Job');
const Category = require('../models/Category');
const Subscription = require('../models/Subscription');

exports.createJob = async (req, res) => {
  try {
    const { categoriesIds, location, isCompanyPost, companyId } = req.body;

    // Verify categories exist and are of type 'Job'
    if (!categoriesIds || !Array.isArray(categoriesIds) || categoriesIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one category is required'
      });
    }

    // Verify all categories exist and are of type 'Job'
    const categories = await Category.find({
      _id: { $in: categoriesIds },
      type: 'Job'
    });

    if (categories.length !== categoriesIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more categories are invalid or not of type Job'
      });
    }

    const job = await Job.create({
      categories: categoriesIds,
      location,
      isCompanyPost: isCompanyPost || false,
      companyId: companyId || null,
      user: req.user._id // Assuming you have authentication middleware
    });

    res.status(201).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id })
      .populate('category')
      .populate('user', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
exports.getAllJobs = async (req, res) => {
  try {
    // Check if user has valid subscription for job search
    const userSubscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    const canSearchJobs = userSubscriptions.some(sub => 
      ['JOB_SEARCH', 'SERVICE_POST'].includes(sub.type)
    );

    if (!canSearchJobs) {
      return res.status(403).json({
        status: 'error',
        message: 'Please subscribe to search jobs',
        subscriptionRequired: true
      });
    }

    const jobs = await Job.find()
      .populate('category')
      .populate('user', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    // Check if user has valid subscription for job search
    const userSubscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    const canSearchJobs = userSubscriptions.some(sub => 
      ['JOB_SEARCH', 'SERVICE_POST'].includes(sub.type)
    );

    if (!canSearchJobs) {
      return res.status(403).json({
        status: 'error',
        message: 'Please subscribe to search jobs',
        subscriptionRequired: true
      });
    }

    const job = await Job.findById(req.params.id)
      .populate('category')
      .populate('user', 'name email phone');

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id })
      .populate('category')
      .populate('user', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
exports.searchJobsByKeyword = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Keyword is required for job search'
      });
    }

    // Check if user has valid subscription for job search
    const userSubscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    const canSearchJobs = userSubscriptions.some(sub =>
      ['JOB_SEARCH', 'SERVICE_POST'].includes(sub.type)
    );

    if (!canSearchJobs) {
      return res.status(403).json({
        status: 'error',
        message: 'Please subscribe to search jobs',
        subscriptionRequired: true
      });
    }

    const keywordRegex = new RegExp(keyword, 'i'); // case-insensitive search

    // First, find matching categories (like 'plumber')
    const matchingCategories = await Category.find({
      type: 'Job',
      name: keywordRegex
    }).select('_id');

    const categoryIds = matchingCategories.map(cat => cat._id);

    
    // Then search jobs that either match:
    // - The category name (already filtered by ID)
    // - OR location fields (partial match)
    const jobs = await Job.find({
      $or: [
        { category: { $in: categoryIds } },
        { 'location.district': keywordRegex },
        { 'location.city': keywordRegex },
        { 'location.state': keywordRegex },
        { tags: keywordRegex },
      ]
    })
      .populate('category')
      .populate('user', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
