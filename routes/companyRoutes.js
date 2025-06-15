const express = require('express');
const { 
  createCompany, 
  getAllCompanies, 
  getCompanyById, 
  getMyCompanies,
  updateCompany,
  deleteCompany 
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/', protect, createCompany);
router.get('/my-companies', protect, getMyCompanies);
router.get('/', protect, getAllCompanies);
router.get('/:id', protect, getCompanyById);
router.patch('/:id', protect, updateCompany);
router.delete('/:id', protect, deleteCompany);

module.exports = router;