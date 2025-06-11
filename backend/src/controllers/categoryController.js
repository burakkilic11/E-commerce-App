const { all: dbAll } = require('../config/db'); // db.js'den 'all' metodunu al
const logger = require('../utils/logger');

// Tüm kategorileri listele
const getAllCategories = async (req, res) => {
    try {
        const categories = await dbAll('SELECT id, name FROM categories ORDER BY name ASC');
        if (!categories) { // dbAll boş array döner, bu kontrol çok gerekli değil ama olabilir
            return res.status(404).json({ message: 'Hiç kategori bulunamadı.' });
        }
        res.status(200).json(categories);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Kategoriler alınırken bir sunucu hatası oluştu.' });
    }
};

module.exports = {
    getAllCategories,
};