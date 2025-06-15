const Company = require('../models/Company');

// Create a new company
exports.createCompany = async (req, res) => {
  try {
    const { name, location, website, about, logo } = req.body;

    const company = await Company.create({
      name,
      location,
      website,
      about,
      logo,
      user: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        company
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    res.status(200).json({
      status: 'success',
      results: companies.length,
      data: {
        companies
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        company
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get my companies
exports.getMyCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      results: companies.length,
      data: {
        companies
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const { name, location, website, about, logo } = req.body;

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    // Check if the company belongs to the logged-in user
    if (company.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this company'
      });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, location, website, about, logo },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        company: updatedCompany
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    // Check if the company belongs to the logged-in user
    if (company.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to delete this company'
      });
    }

    await Company.findByIdAndDelete(req.params.id);

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