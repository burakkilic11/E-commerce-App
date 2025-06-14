const express = require('express');
const router = express.Router();
const {
    getCartItems,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Tüm sepet rotaları kimlik doğrulaması gerektirir
router.use(authenticateToken);

// GET /api/cart - Kullanıcının sepetindeki ürünleri listele
router.get('/', getCartItems);

// POST /api/cart - Sepete ürün ekle
router.post('/', addItemToCart);

// PUT /api/cart/:cartItemId - Sepetteki bir ürünün miktarını güncelle
router.put('/:cartItemId', updateCartItemQuantity);

// DELETE /api/cart/clear - Kullanıcının sepetini temizle
router.delete('/clear', clearCart);

// DELETE /api/cart/:cartItemId - Sepetten bir ürünü kaldır
router.delete('/:cartItemId', removeCartItem);

module.exports = router;