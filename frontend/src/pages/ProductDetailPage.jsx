import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate eklendi (opsiyonel yönlendirme için)
import { fetchProductById } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // AuthContext'i import et
import { addItemToCartApi } from '../services/api'; // Sepete ekleme API'ını import et

function ProductDetailPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth(); // Kullanıcının giriş yapıp yapmadığını kontrol et
    const [feedbackMessage, setFeedbackMessage] = useState(''); // Kullanıcıya geri bildirim için
    const navigate = useNavigate(); // Opsiyonel: Giriş yapmamışsa login'e yönlendirmek için

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const response = await fetchProductById(productId);
                setProduct(response.data);
                setError(null);
            } catch (err) {
                console.error(`Failed to fetch product ${productId}:`, err);
                setError("Ürün detayı yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const handleAddToCart = async () => {
        if (!isAuthenticated()) {
            setFeedbackMessage('Ürünü sepete eklemek için lütfen giriş yapınız.');
            // İsteğe bağlı: Kullanıcıyı login sayfasına yönlendir
            // setTimeout(() => navigate('/login'), 2000); // 2 saniye sonra yönlendir
            return;
        }
        if (product && product.stock > 0) {
            try {
                setFeedbackMessage('Sepete ekleniyor...');
                // productId'nin sayı olduğundan emin olalım (API bekliyorsa)
                await addItemToCartApi({ productId: parseInt(productId), quantity: 1 });
                setFeedbackMessage(`${product.name} sepete eklendi!`);
                // İsteğe bağlı: Sepet sayısını güncellemek için bir event yayınla veya context'i güncelle
                // Örneğin, AuthContext'e bir refreshCartCount() fonksiyonu eklenip burada çağrılabilir.
            } catch (err) {
                console.error("Failed to add to cart:", err);
                setFeedbackMessage(err.response?.data?.message || "Sepete eklenirken bir hata oluştu.");
            }
        }
    };

    // Basit stiller (öncekiyle aynı, kopyalamıyorum, sizde mevcut)
    const styles = {
        container: { maxWidth: '800px', margin: '30px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
        loadingOrError: { textAlign: 'center', fontSize: '1.2em', padding: '20px' },
        backLink: { display: 'block', marginBottom: '20px', color: '#007bff', textDecoration: 'none' },
        productLayout: { display: 'flex', gap: '30px', alignItems: 'flex-start' },
        imageContainer: { flex: '1 1 40%' },
        productImage: { width: '100%', borderRadius: '5px', border: '1px solid #ddd' },
        detailsContainer: { flex: '1 1 60%' },
        productName: { fontSize: '2em', marginBottom: '15px' },
        productCategory: { fontSize: '1em', color: '#555', marginBottom: '10px' },
        productPrice: { fontSize: '1.8em', color: '#28a745', fontWeight: 'bold', margin: '15px 0' },
        productStock: { fontSize: '1em', marginBottom: '10px' },
        productDescription: { lineHeight: '1.6', color: '#333', marginBottom: '20px' },
        actionButton: { 
            padding: '12px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontSize: '1em' 
        },
        feedbackText: { // Yeni stil
            marginTop: '10px', 
            fontSize: '0.9em',
        },
        successText: { // Yeni stil
            color: 'green',
        },
        errorText: { // Yeni stil
            color: 'red',
        },
        warningText: { // Yeni stil
            color: 'orange',
        }
    };


    if (loading) {
        return <div style={styles.loadingOrError}>Ürün detayı yükleniyor...</div>;
    }

    if (error) {
        return <div style={styles.loadingOrError}>{error}</div>;
    }

    if (!product) {
        return <div style={styles.loadingOrError}>Ürün bulunamadı.</div>;
    }

    // Geri bildirim mesajının stili için bir yardımcı
    const getFeedbackStyle = () => {
        if (feedbackMessage.includes('eklendi!')) return styles.successText;
        if (feedbackMessage.includes('giriş yapınız')) return styles.warningText;
        if (feedbackMessage) return styles.errorText; // Diğer tüm feedback'ler hata olarak kabul edilsin
        return {};
    };

    return (
        <div style={styles.container}>
            <Link to="/" style={styles.backLink}>← Geri Dön</Link>
            <div style={styles.productLayout}>
                <div style={styles.imageContainer}>
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        style={styles.productImage}
                    />
                </div>
                <div style={styles.detailsContainer}>
                    <h1 style={styles.productName}>{product.name}</h1>
                    {product.category_name && <p style={styles.productCategory}>Kategori: {product.category_name}</p>}
                    <p style={styles.productPrice}>{product.price.toFixed(2)} TL</p>
                    <p style={styles.productStock}>Stok: {product.stock > 0 ? `${product.stock} adet` : 'Tükendi'}</p>
                    <h3 style={{marginTop: '20px', marginBottom: '10px'}}>Ürün Açıklaması</h3>
                    <p style={styles.productDescription}>{product.description || 'Açıklama bulunmamaktadır.'}</p>
                    <button 
                        onClick={handleAddToCart} 
                        style={styles.actionButton} 
                        disabled={!product || product.stock <= 0} // Giriş yapmamışsa buton aktif ama tıklayınca uyarı verir
                    >
                        {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                    </button>
                    {feedbackMessage && <p style={{...styles.feedbackText, ...getFeedbackStyle()}}>{feedbackMessage}</p>}
                    {!isAuthenticated() && product && product.stock > 0 && 
                        <p style={{...styles.feedbackText, ...styles.warningText}}>
                            Sepete eklemek için <Link to="/login">giriş yapmalısınız</Link>.
                        </p>
                    }
                </div>
            </div>
        </div>
    );
}

export default ProductDetailPage;