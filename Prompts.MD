1. Proje Başlangıcı ve Genel Yapı
Prompt:
“Bana Node.js ve React kullanarak temel bir e-ticaret uygulaması için backend ve frontend dosya yapısı oluştur. Backend’de ürün, kullanıcı, sepet yönetimi ve kimlik doğrulama olmalı. Frontend’de ise ürün listeleme, kullanıcı girişi, sepet ve sipariş ekranları olmalı.”

2. Veritabanı Tasarımı
Prompt:
“SQLite kullanarak ürünler, kullanıcılar, sepet ve sepet_öğeleri için bir veritabanı şeması (schema.sql) hazırla. Her tablo için gerekli alanları ve ilişkileri belirt.”

3. Backend: Kimlik Doğrulama
Prompt:
“Kullanıcıların kayıt olabileceği ve JWT ile giriş yapabileceği bir Node.js Express kimlik doğrulama sistemi yaz. Şifreler hash’lenmeli ve güvenli saklanmalı.”

4. Backend: Ürün Yönetimi
Prompt:
“Yönetici kullanıcıların ürün ekleyip düzenleyebileceği, normal kullanıcıların ise ürünleri listeleyip görebileceği bir ürün yönetim sistemi oluştur. CRUD işlemleri için gerekli endpointleri yaz.”

5. Backend: Sepet Yönetimi
Prompt:
“Kullanıcıların ürünleri sepete ekleyip çıkarabileceği, miktar güncelleyebileceği ve sepetini temizleyebileceği Express endpointleri yaz. Sepet işlemlerinde stok kontrolü yap.”

6. Backend: Loglama ve İzleme
Prompt:
“Tüm önemli işlemler (giriş, ürün ekleme, sepet güncelleme, hata) için bir logger fonksiyonu ekle. Loglar dosyaya ve konsola yazılsın.”

7. Backend: Yetki Tanımlama
Prompt:
“Yalnızca admin kullanıcıların ürün ekleyip düzenleyebileceği, normal kullanıcıların ise sadece görüntüleyebileceği şekilde yetkilendirme middleware’i yaz.”

8. Backend: Temel Raporlama
Prompt:
“Yöneticiler için toplam satış, en çok satılan ürünler ve kullanıcı başına ortalama sepet tutarı gibi temel rapor endpointleri ekle.”

9. Frontend: Kullanıcı Arayüzü
Prompt:
“React ile ürün listeleme, ürün detay, kullanıcı girişi/kayıt, sepet ve sipariş tamamlama ekranlarını oluştur. Sepet işlemleri için backend ile API entegrasyonu yap.”

10. Frontend: Yönetici Paneli
Prompt:
“Yalnızca admin kullanıcıların erişebileceği bir yönetici paneli oluştur. Buradan ürün ekleme, düzenleme ve raporları görüntüleme işlemleri yapılabilsin.”

11. Güvenlik ve Dağıtım
Prompt:
“JWT ile kimlik doğrulama, şifrelerin hash’lenmesi, CORS ayarları ve temel güvenlik önlemlerini ekle. Proje hem Windows hem de Linux üzerinde çalışabilmeli.”

12. Dokümantasyon ve Kurulum
Prompt:
“Projenin nasıl kurulacağı, çalıştırılacağı ve test edileceği ile ilgili detaylı bir README.md dosyası oluştur.”

