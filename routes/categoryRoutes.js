const express = require('express');
const { createCategories, getAllCategories } = require('../controllers/categoryController');

const router = express.Router();

router.post('/', createCategories);
router.get('/', getAllCategories);

module.exports = router;