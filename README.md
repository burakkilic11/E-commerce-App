# Lean Commerce POC

Bu proje, React ve Node.js (Express) ile geliştirilmiş tam işlevsel bir e-ticaret platformu örneğidir. Kullanıcılar ürünleri görüntüleyebilir, sepete ekleyebilir, sipariş verebilir ve kendi profillerini yönetebilirler. Admin kullanıcılar ise ürün ekleyebilir, kullanıcıları yönetebilir ve satış raporlarını görebilir.

## İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kullanım](#kullanım)
- [Proje Mimarisi](#proje-mimarisi)
- [API Endpoints](#api-endpoints)
- [Çevre Değişkenleri (.env)](#env-dosyası)
- [Notlar ve İpuçları](#notlar-ve-ipuçları)

---

## Özellikler

- Kullanıcı kaydı ve girişi (JWT tabanlı kimlik doğrulama)
- Ürün listeleme, detay görüntüleme ve kategoriye göre filtreleme
- Sepete ürün ekleme, miktar güncelleme ve sepetten çıkarma
- Sipariş oluşturma ve geçmiş siparişleri görüntüleme
- Kullanıcı profili görüntüleme
- Admin paneli:
  - Kullanıcı yönetimi (admin yapma)
  - Ürün ekleme
  - Siparişleri ve satış raporlarını görüntüleme
- Responsive ve kullanıcı dostu arayüz

## Teknolojiler

### Frontend

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)

### Backend

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) (şifreleme)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (JWT)
- [winston](https://www.npmjs.com/package/winston) (loglama)

## Kurulum

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/kullanici/lean-commerce-poc.git
cd lean-commerce-poc
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
```

#### .env Dosyası Oluşturun

`backend/.env` dosyasını oluşturun ve aşağıdaki örneğe göre doldurun:

```
PORT=5001
DATABASE_PATH=../database.sqlite
JWT_SECRET=supersecretkey
LOG_DIR=../logs
NODE_ENV=development
```

### 3. Frontend Kurulumu

```bash
cd ../frontend
npm install
```

#### .env Dosyası Oluşturun

`frontend/.env` dosyasını oluşturun ve aşağıdaki örneğe göre doldurun:

```
VITE_API_BASE_URL=http://localhost:5001/api
```

## Geliştirme Ortamı

### Backend'i Başlatın

```bash
cd backend
npm start
```

### Frontend'i Başlatın

```bash
cd frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5001/api](http://localhost:5001/api)

## Kullanım

- Ana sayfada ürünleri ve kategorileri görebilirsiniz.
- Kayıt olup giriş yaptıktan sonra ürünleri sepete ekleyebilir, sepetinizi yönetebilir ve sipariş verebilirsiniz.
- Profil sayfanızdan sipariş geçmişinizi görebilirsiniz.
- Admin kullanıcılar `/admin` panelinden ürün ekleyebilir, kullanıcıları yönetebilir ve raporları görebilir.

## Proje Mimarisi

```
lean-commerce-poc/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── server.js
│   ├── database/
│   │   └── schema.sql
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── .env
```

- **Backend**: Express tabanlı REST API, SQLite veritabanı, JWT ile kimlik doğrulama, rol tabanlı erişim, loglama.
- **Frontend**: React ile SPA, Context API ile global state yönetimi, Axios ile API iletişimi.

## API Endpoints

### Auth

- `POST /api/auth/register` — Kullanıcı kaydı
- `POST /api/auth/login` — Giriş
- `GET /api/auth/profile` — Profil bilgisi (JWT gerekli)

### Ürünler & Kategoriler

- `GET /api/categories` — Kategori listesi
- `GET /api/products` — Ürün listesi (kategori, sayfa, limit ile filtrelenebilir)
- `GET /api/products/:id` — Ürün detayı

### Sepet

- `GET /api/cart` — Sepet içeriği
- `POST /api/cart` — Sepete ürün ekle
- `PUT /api/cart/:cartItemId` — Sepet ürün miktarı güncelle
- `DELETE /api/cart/:cartItemId` — Sepetten ürün çıkar
- `DELETE /api/cart/clear` — Sepeti temizle

### Siparişler

- `POST /api/orders` — Sipariş oluştur
- `GET /api/orders/my` — Kullanıcının siparişleri
- `GET /api/orders` — Tüm siparişler (admin)

### Admin

- `GET /api/admin/users` — Kullanıcı listesi (admin)
- `POST /api/admin/users/:id/make-admin` — Kullanıcıyı admin yap (admin)
- `GET /api/admin/reports` — Raporlar (admin)

## .env Dosyası

### Backend için

```
PORT=5001
DATABASE_PATH=../database.sqlite
JWT_SECRET=supersecretkey
LOG_DIR=../logs
NODE_ENV=development
```

### Frontend için

```
VITE_API_BASE_URL=http://localhost:5001/api
```

## Notlar ve İpuçları

- İlk çalıştırmada veritabanı ve tablo yapısı otomatik oluşturulur.
- Varsayılan olarak admin kullanıcısı yoktur, bir kullanıcıyı admin yapmak için admin panelinden mevcut bir kullanıcıya admin rolü atanabilir.
- Geliştirme ortamında loglar hem dosyaya hem konsola yazılır.
- Tüm API isteklerinde JWT token gerektiren endpointler için `Authorization: Bearer <token>` header'ı kullanılmalıdır.
- Frontend ve backend portları farklıdır, CORS ayarları backend'de açıktır.

---

Her türlü katkı ve geri bildirim için PR gönderebilir veya issue açabilirsiniz.
