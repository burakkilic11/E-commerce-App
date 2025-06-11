const { db, get: dbGet, all: dbAll, run: dbRun } = require('../config/db');
const logger = require('../utils/logger');

// Kullanıcının sepetindeki ürünleri getir
const getCartItems = async (req, res) => {
    const userId = req.user.id; // authenticateToken middleware'inden gelir
    try {
        const cartItems = await dbAll(`
            SELECT ci.id as cart_item_id, p.id as product_id, p.name, p.price, p.image_url, ci.quantity
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [userId]);

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.status(200).json({ items: cartItems, totalAmount });
    } catch (error) {
        logger.error(`Error fetching cart items for user ${userId}:`, error);
        res.status(500).json({ message: 'Sepet ürünleri alınırken bir hata oluştu.' });
    }
};

// Sepete ürün ekle veya mevcut ürünün miktarını artır
const addItemToCart = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body; // quantity varsayılan olarak 1

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Geçersiz ürün ID veya miktar.' });
    }

    try {
        // Ürünün stok durumunu kontrol et
        const product = await dbGet('SELECT stock FROM products WHERE id = ?', [productId]);
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Stok yetersiz. Bu üründen en fazla ${product.stock} adet eklenebilir.` });
        }

        // Kullanıcının sepetinde bu ürün zaten var mı diye kontrol et
        const existingCartItem = await dbGet(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existingCartItem) {
            // Ürün sepette varsa, miktarını güncelle
            const newQuantity = existingCartItem.quantity + quantity;
            if (product.stock < newQuantity) {
                 return res.status(400).json({ message: `Stok yetersiz. Sepetinizdekiyle birlikte bu üründen en fazla ${product.stock} adet eklenebilir.` });
            }
            await dbRun(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existingCartItem.id]
            );
            logger.info(`Cart item quantity updated for user ${userId}, product ${productId}`);
            res.status(200).json({ message: 'Ürün miktarı güncellendi.', cartItemId: existingCartItem.id, newQuantity });
        } else {
            // Ürün sepette yoksa, yeni kayıt ekle
            const result = await dbRun(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
            logger.info(`Product ${productId} added to cart for user ${userId}`);
            res.status(201).json({ message: 'Ürün sepete eklendi.', cartItemId: result.id });
        }
    } catch (error) {
        logger.error(`Error adding item to cart for user ${userId}:`, error);
        res.status(500).json({ message: 'Ürün sepete eklenirken bir hata oluştu.' });
    }
};

// Sepetteki bir ürünün miktarını güncelle
const updateCartItemQuantity = async (req, res) => {
    const userId = req.user.id;
    const { cartItemId } = req.params; // cart_items tablosundaki ID
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Geçersiz miktar. Miktar pozitif bir sayı olmalıdır.' });
    }

    try {
        const cartItem = await dbGet('SELECT product_id FROM cart_items WHERE id = ? AND user_id = ?', [cartItemId, userId]);
        if (!cartItem) {
            return res.status(404).json({ message: 'Sepet öğesi bulunamadı veya size ait değil.' });
        }

        const product = await dbGet('SELECT stock FROM products WHERE id = ?', [cartItem.product_id]);
        if (!product) { // Bu durum pek olası değil ama kontrol etmekte fayda var
            return res.status(404).json({ message: 'İlgili ürün bulunamadı.' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Stok yetersiz. Bu üründen en fazla ${product.stock} adet sepete eklenebilir.` });
        }

        await dbRun(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, cartItemId, userId]
        );
        logger.info(`Cart item ${cartItemId} quantity updated to ${quantity} for user ${userId}`);
        res.status(200).json({ message: 'Sepet ürün miktarı güncellendi.' });
    } catch (error) {
        logger.error(`Error updating cart item ${cartItemId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Sepet ürün miktarı güncellenirken bir hata oluştu.' });
    }
};


// Sepetten bir ürünü kaldır
const removeCartItem = async (req, res) => {
    const userId = req.user.id;
    const { cartItemId } = req.params; // cart_items tablosundaki ID

    try {
        const result = await dbRun(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [cartItemId, userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Sepet öğesi bulunamadı veya size ait değil.' });
        }
        logger.info(`Cart item ${cartItemId} removed for user ${userId}`);
        res.status(200).json({ message: 'Ürün sepetten kaldırıldı.' });
    } catch (error) {
        logger.error(`Error removing cart item ${cartItemId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Ürün sepetten kaldırılırken bir hata oluştu.' });
    }
};

// Kullanıcının sepetini temizle (tüm ürünleri kaldır)
const clearCart = async (req, res) => {
    const userId = req.user.id;
    try {
        await dbRun('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        logger.info(`Cart cleared for user ${userId}`);
        res.status(200).json({ message: 'Sepet başarıyla temizlendi.' });
    } catch (error) {
        logger.error(`Error clearing cart for user ${userId}:`, error);
        res.status(500).json({ message: 'Sepet temizlenirken bir hata oluştu.' });
    }
};


module.exports = {
    getCartItems,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
};