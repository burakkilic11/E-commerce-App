const express = require('express');
const router = express.Router();
const { getAllCategories } = require('../controllers/categoryController');

// GET /api/categories - Tüm kategorileri listele
router.get('/', getAllCategories);

module.exports = router;