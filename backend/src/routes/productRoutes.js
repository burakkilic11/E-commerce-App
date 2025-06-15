const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct } = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// GET /api/products - Tüm ürünleri listele (filtreleme ve pagination ile)
router.get('/', getAllProducts);

// GET /api/products/:id - Tek bir ürünü ID ile getir
router.get('/:id', getProductById);

// POST /api/products - Yeni ürün ekle (sadece admin)
router.post('/', authenticateToken, authorizeRole(['admin']), createProduct);

module.exports = router;