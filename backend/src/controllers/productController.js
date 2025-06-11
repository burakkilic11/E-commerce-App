const { all: dbAll, get: dbGet } = require('../config/db'); // db.js'den 'all' ve 'get' metodlarını al
const logger = require('../utils/logger');

// Tüm ürünleri listele (kategoriye göre filtreleme ve basit pagination ile)
const getAllProducts = async (req, res) => {
    const { categoryId, page = 1, limit = 10 } = req.query; // Query parametrelerini al
    const offset = (page - 1) * limit;

    let sql = `
        SELECT p.id, p.name, p.description, p.price, p.image_url, p.stock, 
               c.id as category_id, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const countSqlParams = []; // Sayım sorgusu için parametreler

    if (categoryId) {
        sql += ' WHERE p.category_id = ?';
        params.push(categoryId);
        countSqlParams.push(categoryId);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // Toplam ürün sayısını almak için sorgu
    let countSql = 'SELECT COUNT(*) as total FROM products';
    if (categoryId) {
        countSql += ' WHERE category_id = ?';
    }


    try {
        const products = await dbAll(sql, params);
        const totalResult = await dbGet(countSql, countSqlParams);
        const totalProducts = totalResult ? totalResult.total : 0;

        if (!products) { // dbAll boş array döner
            return res.status(404).json({ message: 'Hiç ürün bulunamadı.' });
        }
        res.status(200).json({
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalProducts / limit),
                totalItems: totalProducts,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching products:', error);
        res.status(500).json({ message: 'Ürünler alınırken bir sunucu hatası oluştu.' });
    }
};

// Tek bir ürünün detaylarını ID ile getir
const getProductById = async (req, res) => {
    const { id } = req.params; // Route parametresinden ID'yi al (örn: /api/products/123)
    try {
        const product = await dbGet(`
            SELECT p.id, p.name, p.description, p.price, p.image_url, p.stock,
                   c.id as category_id, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (!product) {
            return res.status(404).json({ message: 'Belirtilen ID ile ürün bulunamadı.' });
        }
        res.status(200).json(product);
    } catch (error) {
        logger.error(`Error fetching product with id ${id}:`, error);
        res.status(500).json({ message: 'Ürün detayı alınırken bir sunucu hatası oluştu.' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
};