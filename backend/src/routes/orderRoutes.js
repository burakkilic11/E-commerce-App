const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// Sipariş oluştur (kullanıcı)
router.post('/', authenticateToken, orderController.createOrder);

// Kullanıcının kendi siparişlerini getir
router.get('/my', authenticateToken, orderController.getMyOrders);

// Tüm siparişleri getir (admin)
router.get('/', authenticateToken, authorizeRole(['admin']), orderController.getAllOrders);

module.exports = router;
