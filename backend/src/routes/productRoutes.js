const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById } = require('../controllers/productController');

// GET /api/products - Tüm ürünleri listele (filtreleme ve pagination ile)
router.get('/', getAllProducts);

// GET /api/products/:id - Tek bir ürünü ID ile getir
router.get('/:id', getProductById);

module.exports = router;