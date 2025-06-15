const sqlite3 = require('sqlite3').verbose(); // .verbose() daha detaylı hata mesajları için
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // .env dosyasının doğru yoldan yüklenmesi

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../database.sqlite'); // .env'den al veya varsayılan

// Veritabanı dosyasının bulunduğu dizini kontrol et ve yoksa oluştur
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDB();
    }
});

function initializeDB() {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql'); // schema.sql dosyasının yolu
    fs.readFile(schemaPath, 'utf8', (err, sqlScript) => {
        if (err) {
            console.error('Error reading schema.sql file:', err);
            return;
        }
        db.exec(sqlScript, (execErr) => {
            if (execErr) {
                console.error('Error executing schema:', execErr.message);
            } else {
                console.log('Database schema initialized successfully (or already exists).');
                // Örnek admin kullanıcısını burada oluşturabilir veya güncelleyebiliriz
                // (bcryptjs'i import edip şifreyi hashleyerek)
                // Şimdilik bu kısmı sonraki adımlara bırakalım.
            }
        });
    });

    // Siparişler için tabloyu oluştururken address alanı ekliyoruz
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            address TEXT, -- Adres alanı
            total_amount REAL NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    `);
}

// Promise tabanlı sorgu çalıştırma fonksiyonu (opsiyonel ama kullanışlı)
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) { // `this` kullanmak için arrow function değil
            if (err) {
                console.error('Error running sql: ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes }); // lastID: son eklenen ID, changes: etkilenen satır sayısı
            }
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.error('Error running sql: ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error running sql: ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    db, // Doğrudan db objesine erişim için
    run,
    get,
    all,
    initializeDB // Dışarıdan tetiklemek gerekirse diye
};