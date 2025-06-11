const { verifyToken } = require('../utils/jwtUtils');
const logger = require('../utils/logger');
const { get: getUserById } = require('../config/db'); // Kullanıcıyı DB'den çekmek için get fonksiyonu

/**
 * Kullanıcının kimliğini doğrular.
 * Token geçerliyse req.user objesine kullanıcı bilgilerini ekler.
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN_STRING

    if (token == null) {
        logger.warn('Authentication failed: No token provided', { ip: req.ip, url: req.originalUrl });
        return res.status(401).json({ message: 'Erişim yetkiniz yok (Token bulunamadı).' });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
        logger.warn('Authentication failed: Invalid token', { ip: req.ip, url: req.originalUrl });
        return res.status(403).json({ message: 'Erişim yetkiniz yok (Geçersiz token).' });
    }

    try {
        // Token'daki kullanıcı ID'si ile veritabanından güncel kullanıcı bilgilerini alabiliriz.
        // Bu, kullanıcının durumu (örn: banlanmış) değişirse anında yansıtılmasını sağlar.
        // Ancak her istekte DB'ye gitmek performansı etkileyebilir.
        // POC için sadece token'daki bilgiyi kullanmak da yeterli olabilir.
        // Şimdilik token'daki bilgiyi kullanalım, gerekirse DB'den çekme eklenir.
        /*
        const user = await getUserById('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
        if (!user) {
            logger.warn('Authentication failed: User not found for token', { userId: decoded.id, ip: req.ip });
            return res.status(403).json({ message: 'Erişim yetkiniz yok (Kullanıcı bulunamadı).' });
        }
        req.user = user; // user objesini DB'den gelenle güncelle
        */
        req.user = { id: decoded.id, role: decoded.role }; // Token'dan gelen bilgiyi kullan
        next();
    } catch (error) {
        logger.error('Error during token authentication:', error);
        res.status(500).json({ message: 'Kimlik doğrulama sırasında bir hata oluştu.' });
    }
};

/**
 * Belirli rollere sahip kullanıcıların erişimine izin verir.
 * @param {string[]} allowedRoles İzin verilen rollerin dizisi (örn: ['admin', 'editor'])
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            logger.warn('Authorization failed: User role not found in request', { ip: req.ip, url: req.originalUrl });
            return res.status(403).json({ message: 'Erişim yetkiniz yok (Rol bilgisi eksik).' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Authorization failed: User role '${req.user.role}' not in allowed roles [${allowedRoles.join(', ')}]`, { userId: req.user.id, ip: req.ip, url: req.originalUrl });
            return res.status(403).json({ message: `Bu işlem için yetkiniz yok. Gerekli rol: ${allowedRoles.join(' veya ')}.` });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole,
};