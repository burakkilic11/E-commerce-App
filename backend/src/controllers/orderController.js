const { run: dbRun, all: dbAll, get: dbGet } = require('../config/db');
const logger = require('../utils/logger');

// Sipariş oluştur
const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { shipping_address } = req.body; // Şemaya uygun alan adı
    if (!shipping_address) return res.status(400).json({ message: 'Adres zorunludur.' });

    try {
        const cartItems = await dbAll(`
            SELECT ci.product_id, ci.quantity, p.price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [userId]);
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Sepetiniz boş.' });
        }
        const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const orderResult = await dbRun(
            'INSERT INTO orders (user_id, total_amount, shipping_address, created_at) VALUES (?, ?, ?, datetime("now"))',
            [userId, totalAmount, shipping_address]
        );
        const orderId = orderResult.id;

        for (const item of cartItems) {
            await dbRun(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await dbRun(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await dbRun('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu.', orderId });
    } catch (error) {
        logger.error('Order creation error:', error);
        res.status(500).json({ message: 'Sipariş oluşturulurken hata oluştu.' });
    }
};

// Kullanıcının kendi siparişlerini getir
const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const orders = await dbAll(
            'SELECT id, shipping_address, total_amount, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        for (const order of orders) {
            order.items = await dbAll(
                `SELECT oi.product_id, p.name, oi.quantity, oi.price_at_purchase
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
        }
        res.json(orders);
    } catch (error) {
        logger.error('Get my orders error:', error);
        res.status(500).json({ message: 'Siparişler alınırken hata oluştu.' });
    }
};

// Tüm siparişleri getir (admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await dbAll(
            `SELECT o.id, o.user_id, u.name as user_name, o.shipping_address, o.total_amount, o.created_at
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`
        );
        for (const order of orders) {
            order.items = await dbAll(
                `SELECT oi.product_id, p.name, oi.quantity, oi.price_at_purchase
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
        }
        res.json(orders);
    } catch (error) {
        logger.error('Get all orders error:', error);
        res.status(500).json({ message: 'Siparişler alınırken hata oluştu.' });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
};
