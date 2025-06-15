const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // .env dosyasını src klasöründen yükle
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger'); // Logger'ımızı import ettik
const { db, initializeDB } = require('./config/db'); // db objesini ve initializeDB fonksiyonunu import ettik

const authRoutes = require('./routes/authRoutes'); // Auth rotalarını import et
const app = express();
const PORT = process.env.PORT || 5001; // .env'den PORT al veya varsayılan 5001 kullan

const categoryRoutes = require('./routes/categoryRoutes'); // Category rotalarını import et
const productRoutes = require('./routes/productRoutes');   // Product rotalarını import et
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Sipariş rotalarını import et

// Middleware'ler
app.use(cors()); // CORS'u etkinleştir
app.use(express.json()); // Gelen JSON request body'lerini parse et
app.use(express.urlencoded({ extended: true })); // Gelen URL-encoded request body'lerini parse et

// API Rotaları
app.get('/api', (req, res) => { // Bu genel /api route'u kalabilir veya kaldırılabilir
    res.json({ message: 'Lean Commerce POC API\'ye hoş geldiniz!' });
});
app.use('/api/auth', authRoutes); // Auth rotalarını /api/auth altında kullanıma aç

app.use('/api/categories', categoryRoutes); // Category rotalarını /api/categories altında kullanıma aç
app.use('/api/products', productRoutes);     // Product rotalarını /api/products altında kullanıma aç
app.use('/api/cart', cartRoutes);     // Cart rotalarını /api/cart altında kullanıma aç
app.use('/api/admin', adminRoutes); // Admin rotalarını /api/admin altında kullanıma aç
app.use('/api/orders', orderRoutes); // Sipariş rotalarını ekle

// Temel bir health check endpoint'i
app.get('/api/health', (req, res) => {
    // Veritabanı bağlantısını da kontrol edebiliriz
    // Şimdilik basit tutalım
    if (db) { // db objesi var mı diye kontrol edelim
        // Basit bir sorgu ile veritabanının cevap verip vermediğini kontrol edebiliriz.
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", (err, row) => {
            if (err) {
                logger.error('Health check DB error:', err);
                return res.status(503).json({ status: 'error', message: 'API çalışıyor ama veritabanı hatası var.', dbError: err.message });
            }
            if (row) {
                return res.status(200).json({ status: 'ok', message: 'API ve Veritabanı çalışıyor.' });
            }
            return res.status(503).json({ status: 'error', message: 'API çalışıyor ama veritabanı şeması bulunamadı.' });
        });
    } else {
        res.status(503).json({ status: 'error', message: 'API çalışıyor ama veritabanı bağlantısı yok.' });
    }
});


// Hata Yönetimi Middleware'i (Tüm route'lardan sonra gelmeli)
// Şimdilik basit bir tane ekleyelim, sonra detaylandırırız.
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({
        message: err.message || 'Sunucuda bir hata oluştu.',
        // Geliştirme ortamında stack trace'i de gönderebiliriz
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});


// Sunucuyu Başlat
app.listen(PORT, () => {
    logger.info(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
    // initializeDB(); // db.js içinde bağlantı kurulunca otomatik çağrılıyor.
                      // Eğer manuel çağırmak isterseniz burada da çağırabilirsiniz.
});

// Uygulama kapatılırken veritabanı bağlantısını kapat
process.on('SIGINT', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                logger.error('Error closing database', err.message);
            } else {
                logger.info('Database connection closed.');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});