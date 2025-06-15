const express = require('express');
const router = express.Router();
const { all: dbAll, run: dbRun } = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Tüm kullanıcıları listele (sadece admin)
router.get('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const users = await dbAll('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcılar alınırken hata oluştu.' });
    }
});

// Kullanıcıya admin rolü atama (sadece admin)
router.post('/users/:id/make-admin', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        await dbRun('UPDATE users SET role = ? WHERE id = ?', ['admin', req.params.id]);
        res.json({ message: 'Kullanıcı admin yapıldı.' });
    } catch (error) {
        res.status(500).json({ message: 'Rol güncellenirken hata oluştu.' });
    }
});

// Basit raporlar (sadece admin)
router.get('/reports', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        // Toplam kullanıcı sayısı
        const userCountRow = await dbAll('SELECT COUNT(*) as count FROM users');
        // Toplam sipariş sayısı
        const orderCountRow = await dbAll('SELECT COUNT(*) as count FROM orders');
        // Toplam ciro
        const totalRevenueRow = await dbAll('SELECT SUM(total_amount) as total FROM orders');
        // En çok satan ürünler (ilk 5)
        const bestSellers = await dbAll(`
            SELECT p.id, p.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY oi.product_id
            ORDER BY total_sold DESC
            LIMIT 5
        `);

        res.json({
            userCount: userCountRow[0]?.count || 0,
            orderCount: orderCountRow[0]?.count || 0,
            totalRevenue: totalRevenueRow[0]?.total || 0,
            bestSellers
        });
    } catch (error) {
        res.status(500).json({ message: 'Raporlar alınırken hata oluştu.' });
    }
});

module.exports = router;