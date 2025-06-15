import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCart, updateCartItemQuantityApi, removeCartItemApi, clearCartApi, createOrderApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

function CartPage() {
    const { isAuthenticated, user, loading: authLoading, refreshCartItemCount } = useAuth(); // refreshCartItemCount eklendi
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [orderStatus, setOrderStatus] = useState(null);
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);
    const navigate = useNavigate();

    const fetchCartData = async () => {
        if (!isAuthenticated()) {
            setError("Sepetinizi görmek için lütfen giriş yapın.");
            setLoading(false);
            setCart(null);
            return;
        }
        try {
            setLoading(true);
            const response = await getCart();
            setCart(response.data);
            setError(null);
            await refreshCartItemCount(); // Sepet sayısını her fetch'te güncelle
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            setError("Sepet yüklenirken bir hata oluştu.");
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) { // AuthContext yüklenmesi bittikten sonra
            fetchCartData();
        }
    }, [isAuthenticated, authLoading]); // Giriş durumu değiştiğinde veya auth yüklenmesi bittikten sonra sepeti yeniden yükle

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            await handleRemoveItem(cartItemId);
            return;
        }
        try {
            await updateCartItemQuantityApi(cartItemId, { quantity: newQuantity });
            await fetchCartData();
        } catch (err) {
            alert(err.response?.data?.message || "Miktar güncellenirken hata oluştu.");
            console.error("Failed to update quantity:", err);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await removeCartItemApi(cartItemId);
            await fetchCartData();
        } catch (err) {
            alert("Ürün sepetten kaldırılırken hata oluştu.");
            console.error("Failed to remove item:", err);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm("Sepetinizdeki tüm ürünleri silmek istediğinizden emin misiniz?")) {
            try {
                await clearCartApi();
                await fetchCartData();
            } catch (err) {
                alert("Sepet temizlenirken hata oluştu.");
                console.error("Failed to clear cart:", err);
            }
        }
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        setOrderStatus(null);
        if (!shippingAddress.trim()) {
            setOrderStatus({ type: 'error', msg: 'Adres alanı zorunludur.' });
            return;
        }
        try {
            await createOrderApi({ shipping_address: shippingAddress });
            setOrderStatus({ type: 'success', msg: 'Siparişiniz başarıyla oluşturuldu!' });
            setShippingAddress('');
            setShowOrderForm(false);
            setShowOrderSuccess(true);
            setTimeout(() => setShowOrderSuccess(false), 3500);
            await fetchCartData(); // Sepeti ve sepet sayısını güncelle
        } catch (err) {
            setOrderStatus({ type: 'error', msg: err.response?.data?.message || 'Sipariş oluşturulamadı.' });
        }
    };

    // Basit stiller
    const styles = {
        container: { maxWidth: '900px', margin: '30px auto', padding: '20px' },
        loadingOrError: { textAlign: 'center', fontSize: '1.2em', padding: '20px' },
        emptyCart: { textAlign: 'center', fontSize: '1.1em', padding: '30px', border: '1px dashed #ccc' },
        cartItem: { 
            display: 'flex', 
            alignItems: 'center', 
            borderBottom: '1px solid #eee', 
            padding: '15px 0',
            gap: '15px'
        },
        itemImage: { width: '80px', height: '80px', objectFit: 'contain', marginRight: '15px' },
        itemDetails: { flexGrow: 1 },
        itemName: { fontSize: '1.1em', fontWeight: 'bold' },
        itemPrice: { color: '#555' },
        itemQuantity: { display: 'flex', alignItems: 'center', gap: '8px' },
        quantityInput: { width: '50px', textAlign: 'center', padding: '5px', backgroundColor: '#fff', color: '#000' },
        itemTotal: { fontWeight: 'bold', minWidth: '80px', textAlign: 'right' },
        removeButton: { color: 'red', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1em'},
        cartSummary: { marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'right' },
        summaryText: { fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' },
        actionButtons: { marginTop: '20px', display: 'flex', justifyContent: 'space-between' }
    };


    if (authLoading || loading) return <div style={styles.loadingOrError}>Sepet yükleniyor...</div>;
    if (error) return <div style={styles.loadingOrError}>{error}</div>;
    if (!isAuthenticated()) return <div style={styles.loadingOrError}>Sepetinizi görmek için lütfen <Link to="/login">giriş yapın</Link>.</div>;
    if (!cart || cart.items.length === 0) {
        return (
            <div style={styles.container}>
                <h2>Sepetim</h2>
                <div style={styles.emptyCart}>
                    <p>Sepetiniz şu anda boş.</p>
                    <Link to="/">Alışverişe Başla</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2>Sepetim ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} ürün)</h2>
            {cart.items.map(item => (
                <div key={item.cart_item_id} style={styles.cartItem}>
                    <img src={item.image_url} alt={item.name} style={styles.itemImage} />
                    <div style={styles.itemDetails}>
                        <p style={styles.itemName}>{item.name}</p>
                        <p style={styles.itemPrice}>{item.price.toFixed(2)} TL</p>
                    </div>
                    <div style={styles.itemQuantity}>
                        <button onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)} style={{backgroundColor: 'rgba(221, 102, 47, 0.88)', color: 'white'}}>-</button>
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.cart_item_id, parseInt(e.target.value))}
                            style={styles.quantityInput}
                            min="1" // Kullanıcı doğrudan 0 giremesin, silme butonuyla yapsın
                        />
                        <button onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)} style={{backgroundColor: 'rgba(221, 102, 47, 0.88)', color: 'white'}}>+</button>
                    </div>
                    <p style={styles.itemTotal}>{(item.price * item.quantity).toFixed(2)} TL</p>
                    <button onClick={() => handleRemoveItem(item.cart_item_id)} style={styles.removeButton}>Kaldır</button>
                </div>
            ))}
            <div style={styles.cartSummary}>
                <p style={styles.summaryText}>Toplam Tutar: {cart.totalAmount.toFixed(2)} TL</p>
                <div style={styles.actionButtons}>
                    <button onClick={handleClearCart} style={{backgroundColor: '#dc3545', color: 'white'}}>Sepeti Temizle</button>
                    <button
                        onClick={() => setShowOrderForm(true)}
                        style={{backgroundColor: '#28a745', color: 'white'}}
                        disabled={cart.items.length === 0}
                    >
                        Siparişi Tamamla
                    </button>
                </div>
                {showOrderForm && (
                    <form onSubmit={handleOrderSubmit} style={{marginTop: 20, textAlign: 'left'}}>
                        <label>
                            Teslimat Adresi:
                            <textarea
                                value={shippingAddress}
                                onChange={e => setShippingAddress(e.target.value)}
                                required
                                rows={3}
                                style={{width: '100%', marginTop: 8, marginBottom: 8, backgroundColor: '#fff', color: '#000', borderRadius: 4, border: '1px solid #ced4da'}}
                            />
                        </label>
                        <button type="submit" style={{backgroundColor: '#007bff', color: 'white', marginRight: 8}}>Siparişi Onayla</button>
                        <button type="button" onClick={() => setShowOrderForm(false)}>Vazgeç</button>
                    </form>
                )}
                {orderStatus && (
                    <div style={{marginTop: 10, color: orderStatus.type === 'success' ? 'green' : 'red'}}>
                        {orderStatus.msg}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;