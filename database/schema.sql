-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('customer', 'admin')) DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category_id INTEGER,
    stock INTEGER DEFAULT 0, -- Stok bilgisi ekleyelim
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL -- Kategori silinirse ürünün kategorisi NULL olur
);

-- Cart Items Table (Her kullanıcının aktif bir sepeti olacak mantığıyla)
-- Bu tablo, bir kullanıcının sepetindeki ürünleri ve miktarlarını tutar.
-- Kullanıcı bir sipariş verdiğinde bu tablodaki ilgili kayıtlar silinebilir veya "pasif" hale getirilebilir.
-- Daha basit bir POC için, her kullanıcının aktif sepet öğelerini tutacağız.
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE, -- Kullanıcı silinirse sepet öğeleri de silinir
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE, -- Ürün silinirse sepet öğesi de silinir
    UNIQUE (user_id, product_id) -- Bir kullanıcı bir ürünü sepetine sadece bir kez ekleyebilir (miktar güncellenir)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    shipping_address TEXT, -- Basit bir adres alanı
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT -- Kullanıcının siparişleri varsa silinmesini engelle
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase REAL NOT NULL, -- Sipariş anındaki ürün fiyatı
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE, -- Sipariş silinirse öğeleri de silinir
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT -- Ürün silinirse sipariş öğesi etkilenmez (ürün bilgisi kalır)
);

-- Örnek Admin Kullanıcısı (İsteğe Bağlı - Geliştirme için)
-- Şifre: "admin123" (bcrypt ile hashlenmiş halini daha sonra backend'de oluşturacağız)
-- Bu satırı şimdilik yorumda bırakabilir veya silebilirsiniz, backend'de yönetmek daha iyi olabilir.
-- INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@example.com', 'HENUZ_HASHLENMEDI', 'admin');

-- Örnek Kategoriler (İsteğe Bağlı - Geliştirme için)
INSERT OR IGNORE INTO categories (name) VALUES ('Elektronik');
INSERT OR IGNORE INTO categories (name) VALUES ('Kitap');
INSERT OR IGNORE INTO categories (name) VALUES ('Giyim');

-- Örnek Ürünler (İsteğe Bağlı - Geliştirme için)
INSERT OR IGNORE INTO products (name, description, price, category_id, stock, image_url) VALUES
('Akıllı Telefon X', 'En yeni model akıllı telefon', 2999.99, (SELECT id from categories WHERE name = 'Elektronik'), 50, 'https://via.placeholder.com/150/0000FF/808080?Text=TelefonX'),
('Yazılım Sanatı', 'Harika bir programlama kitabı', 79.50, (SELECT id from categories WHERE name = 'Kitap'), 120, 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Kitap1'),
('Pamuklu Tişört', 'Rahat ve şık pamuklu tişört', 49.90, (SELECT id from categories WHERE name = 'Giyim'), 200, 'https://via.placeholder.com/150/00FF00/000000?Text=Tshirt');