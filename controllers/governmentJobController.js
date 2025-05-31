const GovernmentJob = require('../models/GovernmentJob');

exports.createGovernmentJob = async (req, res) => {
  try {
    const { jobTitle, organizationName, lastDateToApply, applyLink, jobType } = req.body;

    const governmentJob = await GovernmentJob.create({
      jobTitle,
      organizationName,
      lastDateToApply,
      applyLink,
      jobType,
      postedBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        governmentJob
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllGovernmentJobs = async (req, res) => {
  try {
    const governmentJobs = await GovernmentJob.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: governmentJobs.length,
      data: {
        governmentJobs
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getGovernmentJobById = async (req, res) => {
  try {
    const governmentJob = await GovernmentJob.findById(req.params.id);

    if (!governmentJob) {
      return res.status(404).json({
        status: 'error',
        message: 'Government job not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        governmentJob
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateGovernmentJob = async (req, res) => {
  try {
    const governmentJob = await GovernmentJob.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!governmentJob) {
      return res.status(404).json({
        status: 'error',
        message: 'Government job not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        governmentJob
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteGovernmentJob = async (req, res) => {
  try {
    const governmentJob = await GovernmentJob.findByIdAndDelete(req.params.id);

    if (!governmentJob) {
      return res.status(404).json({
        status: 'error',
        message: 'Government job not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};