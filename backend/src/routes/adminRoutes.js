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

module.exports = router;