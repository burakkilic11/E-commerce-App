const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // .env'i doğru yoldan yükle

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h'; // Token geçerlilik süresi (örneğin 1 saat)

/**
 * Kullanıcı ID'si ile JWT oluşturur.
 * @param {number} userId Kullanıcının ID'si
 * @param {string} userRole Kullanıcının rolü
 * @returns {string} Oluşturulan JWT
 */
const generateToken = (userId, userRole) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in .env file');
    }
    const payload = {
        id: userId,
        role: userRole, // Rol bilgisini de token'a ekleyelim
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verilen JWT'yi doğrular.
 * @param {string} token Doğrulanacak JWT
 * @returns {object|null} Doğrulanmış payload veya hata durumunda null
 */
const verifyToken = (token) => {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined in .env file for verification');
        return null;
    }
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        // console.error('Invalid token:', error.message); // Geliştirme sırasında loglayabiliriz
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
};