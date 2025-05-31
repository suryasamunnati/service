const express = require('express');
const { createCategories, getAllCategories, getCategoriesByType } = require('../controllers/categoryController');

const router = express.Router();

router.post('/', createCategories);
router.get('/', getAllCategories);
router.get('/type/:type', getCategoriesByType);

module.exports = router;