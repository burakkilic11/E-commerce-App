const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtils');
const { run: dbRun, get: dbGet } = require('../config/db'); // db.js'den run ve get metodlarını al
const logger = require('../utils/logger');

const SALT_ROUNDS = 10; // bcrypt için salt rounds

// Kullanıcı Kaydı
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Lütfen tüm alanları doldurun (isim, e-posta, şifre).' });
    }

    // E-posta formatını basitçe kontrol et (daha kapsamlı validasyon eklenebilir)
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Geçerli bir e-posta adresi girin.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }


    try {
        // E-posta zaten kayıtlı mı kontrol et
        const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            logger.warn(`Registration attempt with existing email: ${email}`);
            return res.status(409).json({ message: 'Bu e-posta adresi zaten kayıtlı.' }); // 409 Conflict
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Yeni kullanıcıyı veritabanına ekle
        // Varsayılan rol 'customer' olacak (schema.sql'de tanımlı)
        const result = await dbRun(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        if (result && result.id) {
            const newUser = { id: result.id, name, email, role: 'customer' }; // rol varsayılan olarak customer
            // Token oluştur
            const token = generateToken(newUser.id, newUser.role);
            logger.info(`User registered successfully: ${email} (ID: ${newUser.id})`);
            res.status(201).json({
                message: 'Kullanıcı başarıyla kaydedildi.',
                token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            });
        } else {
            throw new Error('User could not be created in DB');
        }
    } catch (error) {
        logger.error('Error during user registration:', { error: error.message, email });
        res.status(500).json({ message: 'Kayıt sırasında bir sunucu hatası oluştu.' });
    }
};

// Kullanıcı Girişi
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    try {
        // Kullanıcıyı e-posta ile bul
        const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            logger.warn(`Login attempt with non-existing email: ${email}`);
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' }); // Kullanıcı bulunamadı mesajı yerine genel mesaj
        }

        // Şifreyi karşılaştır
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            logger.warn(`Failed login attempt for email: ${email}`);
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        // Token oluştur
        const token = generateToken(user.id, user.role);
        logger.info(`User logged in successfully: ${email} (ID: ${user.id})`);
        res.status(200).json({
            message: 'Giriş başarılı.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Error during user login:', { error: error.message, email });
        res.status(500).json({ message: 'Giriş sırasında bir sunucu hatası oluştu.' });
    }
};

// (Opsiyonel) Giriş yapmış kullanıcının kendi profilini getirmesi için
const getMyProfile = async (req, res) => {
    // Bu fonksiyon authenticateToken middleware'inden sonra çağrılacağı için req.user mevcut olacak.
    try {
        // req.user.id ile veritabanından güncel kullanıcı bilgilerini çekebiliriz (şifre hariç)
        const user = await dbGet('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error fetching user profile:', { userId: req.user.id, error: error.message });
        res.status(500).json({ message: 'Profil bilgileri alınırken bir hata oluştu.' });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getMyProfile
};