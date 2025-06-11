const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMyProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware'); // Sadece kimlik doğrulama middleware'i

// POST /api/auth/register - Kullanıcı Kaydı
router.post('/register', registerUser);

// POST /api/auth/login - Kullanıcı Girişi
router.post('/login', loginUser);

// GET /api/auth/profile - Giriş yapmış kullanıcının profilini getir
// Bu endpoint'i korumak için authenticateToken middleware'ini kullanıyoruz.
router.get('/profile', authenticateToken, getMyProfile);

module.exports = router;