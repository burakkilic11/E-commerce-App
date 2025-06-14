import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategories, fetchProducts, addItemToCartApi } from '../services/api'; // addItemToCartApi eklendi
import { Link, useNavigate } from 'react-router-dom'; // useNavigate eklendi (opsiyonel)

function HomePage() {
    const { user, isAuthenticated } = useAuth(); // isAuthenticated artık useAuth'tan geliyor
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState(null);
    const [cartFeedback, setCartFeedback] = useState({}); // Her ürün için ayrı feedback { productId: 'mesaj' }
    const navigate = useNavigate(); // Opsiyonel: Giriş yapmamışsa login'e yönlendirmek için

    // Pagination state'leri
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await fetchCategories();
                setCategories(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError("Kategoriler yüklenirken bir hata oluştu.");
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoadingProducts(true);
                const params = { page: currentPage, limit: 6 };
                if (selectedCategory) {
                    params.categoryId = selectedCategory;
                }
                const response = await fetchProducts(params);
                setProducts(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Ürünler yüklenirken bir hata oluştu.");
            } finally {
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, [currentPage, selectedCategory]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleAddToCartFromHome = async (productToAdd) => {
        if (!isAuthenticated()) { // isAuthenticated() fonksiyonunu çağırıyoruz
            setCartFeedback(prev => ({ ...prev, [productToAdd.id]: 'Giriş yapmalısınız!' }));
            // setTimeout(() => navigate('/login'), 2000); // Opsiyonel
            return;
        }
        if (productToAdd && productToAdd.stock > 0) {
            try {
                setCartFeedback(prev => ({ ...prev, [productToAdd.id]: 'Sepete ekleniyor...' }));
                await addItemToCartApi({ productId: productToAdd.id, quantity: 1 });
                setCartFeedback(prev => ({ ...prev, [productToAdd.id]: 'Sepete Eklendi!' }));
                // Geri bildirimi bir süre sonra temizle
                setTimeout(() => {
                    setCartFeedback(prev => {
                        const newState = { ...prev };
                        delete newState[productToAdd.id];
                        return newState;
                    });
                }, 3000);
                 // İsteğe bağlı: Navbar'daki sepet sayısını güncellemek için global state/context güncellemesi
            } catch (err) {
                console.error("Failed to add to cart from home:", err);
                setCartFeedback(prev => ({ ...prev, [productToAdd.id]: err.response?.data?.message || "Sepete eklenirken bir hata oluştu." }));
            }
        }
    };

    // Basit stiller (öncekiyle aynı, kopyalamıyorum, sizde mevcut)
    const styles = {
        container: { padding: '20px' },
        welcomeMessage: { textAlign: 'center', marginBottom: '30px', color: "rgba(70, 66, 66, 0.87)", fontWeight: 'bold' },
        contentLayout: { display: 'flex', gap: '20px' },
        categoryList: { 
            listStyleType: 'none',
            flex: '0 0 200px', 
            border: '1px solid #eee', 
            padding: '15px', 
            borderRadius: '5px',
            maxHeight: '500px',
            overflowY: 'auto'
        },
        categoryItem: {
            padding: '8px',
            cursor: '  pointer',
            borderRadius: '4px',
            marginBottom: '5px',
            color: 'black',
            border: '1px solid ', 
            borderColor: 'rgba(128, 130, 138, 0.87)', // Daha belirgin bir renk
        },
        categoryItemSelected: {
            background: 'rgba(245, 92, 46, 0.87)', // Daha belirgin bir renk
            fontWeight: 'bold',
            color: 'white',
        },
        productList: { 
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '20px' 
        },
        productCard: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center',
            backgroundColor: 'rgba(238, 241, 243, 0.9)', // Daha açık bir arka plan rengi
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            display: 'flex', // Kart içeriğini dikeyde hizalamak için
            flexDirection: 'column', // Dikeyde sırala
            justifyContent: 'space-between' // İçeriği dağıt (isim/fiyat yukarı, butonlar aşağı)
        },
        productImage: {
            maxWidth: '100%',
            height: '150px',
            objectFit: 'contain', 
            marginBottom: '10px',
            borderRadius: '8px', // Görsel köşelerini yuvarlamak için
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Görsel için hafif gölge
        },
        productInfo: { // İsim ve fiyatı gruplamak için
            flexGrow: 1, // Butonlar aşağıda kalsın diye
        },
        productName: { fontSize: '1.1em', fontWeight: 'bold', margin: '10px 0 5px 0' },
        productPrice: { fontSize: '1em', color: '#000000', marginBottom: '10px',fontWeight: 'bold' },
        productActions: { // Butonları ve feedback'i gruplamak için
            marginTop: 'auto', // Butonları kartın en altına it
        },
        actionButton: { // Genel buton stili
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em',
            marginRight: '5px', // Detay ve Sepete Ekle butonları arasına boşluk
        },
        detailsButton: { // Detay butonu için özel stil
             backgroundColor: '#6c757d', // Gri tonu
             color: 'white',
        },
        addToCartButton: { // Sepete Ekle butonu için özel stil
            backgroundColor: '#28a745', // Yeşil
            color: 'white',
        },
        feedbackText: { // Yeni stil
            fontSize: '0.8em',
            marginTop: '5px',
            height: '1.2em' // Feedback mesajı yokken de yer kaplasın, kayma olmasın
        },
        successText: { color: 'green' },
        errorText: { color: 'red' },
        warningText: { color: 'orange' },
        pagination: { 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: '30px',
            gap: '10px'
        },
        pageButton: {
            padding: '8px 12px',
            border: '1px solid #ddd',
            cursor: 'pointer',
            backgroundColor: 'rgba(143, 148, 182, 0.87)', // Daha belirgin bir renk
        },
        pageButtonDisabled: {
            cursor: 'not-allowed',
            opacity: 0.5
        },
        pageInfo: { margin: '0 10px' },
        loadingOrError: { textAlign: 'center', fontSize: '1.2em', padding: '20px' }
    };

    const getFeedbackStyle = (productId) => {
        const feedback = cartFeedback[productId];
        if (!feedback) return {};
        if (feedback.includes('Eklendi!')) return styles.successText;
        if (feedback.includes('giriş yapmalısınız')) return styles.warningText;
        if (feedback) return styles.errorText;
        return {};
    };

    if (error && !products.length) { // Ürünler hiç yüklenemediyse genel hata
        return <div style={styles.loadingOrError}>{error}</div>;
    }
    
    // ... (return JSX kısmı aşağıda)
    // ... (HomePage fonksiyonunun üst kısmı ve stiller yukarıdaki gibi)

    return (
        <div style={styles.container}>
            <div style={styles.welcomeMessage}>
                <h1>E-Ticaret Platformumuza Hoş Geldiniz!</h1>
                {isAuthenticated() ? (
                    <p>Merhaba, {user?.name || 'Kullanıcı'}!</p>
                ) : (
                    <p>Alışverişe başlamak için lütfen giriş yapın veya kayıt olun.</p>
                )}
            </div>

            <div style={styles.contentLayout}>
                {/* Kategori Listesi */}
                <aside style={styles.categoryList}>
                    <h3>Kategoriler</h3>
                    {loadingCategories ? <p>Yükleniyor...</p> : (
                        <ul style={{ listStyleType: 'none', padding: 0 }}>

                            <li 
                                style={{
                                    ...styles.categoryItem, 
                                    ...(selectedCategory === '' ? styles.categoryItemSelected : {})
                                }}
                                onClick={() => handleCategoryChange('')}
                            >
                                Tüm Ürünler
                            </li>
                            {categories.map(category => (
                                <li 
                                    key={category.id} 
                                    style={{
                                        ...styles.categoryItem, 
                                        ...(selectedCategory === category.id.toString() ? styles.categoryItemSelected : {})
                                    }}
                                    onClick={() => handleCategoryChange(category.id.toString())}
                                >
                                    {category.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* Ürün Listesi */}
                <main style={{flex: 1}}>
                    {loadingProducts ? <div style={styles.loadingOrError}>Ürünler yükleniyor...</div> : (
                        products.length > 0 ? (
                            <>
                                <div style={styles.productList}>
                                    {products.map(product => (
                                        <div key={product.id} style={styles.productCard}>
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name} 
                                                style={styles.productImage} 
                                            />
                                            <div style={styles.productInfo}>
                                                <h4 style={styles.productName}>{product.name}</h4>
                                                <p style={styles.productPrice}>{product.price.toFixed(2)} TL</p>
                                            </div>
                                            <div style={styles.productActions}>
                                                <Link to={`/products/${product.id}`}>
                                                    <button style={{...styles.actionButton, ...styles.detailsButton}}>Detay</button>
                                                </Link>
                                                <button 
                                                    onClick={() => handleAddToCartFromHome(product)} 
                                                    disabled={!product || product.stock <= 0} // Giriş kontrolü handleAddToCartFromHome içinde yapılıyor
                                                    style={{...styles.actionButton, ...styles.addToCartButton}}
                                                >
                                                    {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                                                </button>
                                                <p style={{...styles.feedbackText, ...getFeedbackStyle(product.id)}}>
                                                    {cartFeedback[product.id] || ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={styles.pagination}>
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            style={{...styles.pageButton, ...(currentPage === 1 ? styles.pageButtonDisabled : {})}}
                                        >
                                            Önceki
                                        </button>
                                        <span style={styles.pageInfo}>Sayfa {currentPage} / {totalPages}</span>
                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)} 
                                            disabled={currentPage === totalPages}
                                            style={{...styles.pageButton, ...(currentPage === totalPages ? styles.pageButtonDisabled : {})}}
                                        >
                                            Sonraki
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={styles.loadingOrError}>
                                {selectedCategory ? "Bu kategoride ürün bulunamadı." : "Henüz hiç ürün eklenmemiş."}
                            </p>
                        )
                    )}
                    {error && !loadingProducts && products.length > 0 && <p style={styles.loadingOrError}>{error}</p>} {/* Hata varsa ama ürünler de varsa göster */}
                </main>
            </div>
        </div>
    );
}

export default HomePage;
// } // HomePage fonksiyonu burada bitiyor

// export default HomePage; // Ve burada export ediliyor