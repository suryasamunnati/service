const Job = require('../models/Job');
const Category = require('../models/Category');
const Subscription = require('../models/Subscription');

exports.createJob = async (req, res) => {
  try {
    const { categoryId, images, location } = req.body;

    // Verify category exists and is of type 'Job'
    const category = await Category.findById(categoryId);
    if (!category || category.type !== 'Job') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid category or category type'
      });
    }

    const job = await Job.create({
      category: categoryId,
      images,
      location,
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