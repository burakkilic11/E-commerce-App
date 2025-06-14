import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCart } from '../../services/api';

function Navbar() {
    const { isAuthenticated, logout, user, token } = useAuth(); // token eklendi
    const navigate = useNavigate();
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        const fetchCartCount = async () => {
            if (isAuthenticated() && token) { // Sadece giriş yapmış ve token'ı olan kullanıcılar için
                try {
                    const response = await getCart();
                    const count = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
                    setCartItemCount(count);
                } catch (error) {
                    console.error("Navbar: Failed to fetch cart count", error);
                    // Token geçersizse veya başka bir sorun varsa sayıyı 0 olarak bırakabiliriz
                    // Veya kullanıcıyı logout yapabiliriz
                    if (error.response && error.response.status === 401) {
                        // Belki burada logout tetiklenebilir veya context'te ele alınabilir.
                        // Şimdilik sadece sayıyı sıfırlayalım.
                        setCartItemCount(0);
                    }
                }
            } else {
                setCartItemCount(0); // Kullanıcı giriş yapmamışsa sepet sayısı 0
            }
        };

        fetchCartCount();
        // Sepet güncellendiğinde bu sayının da güncellenmesi için daha gelişmiş bir state management (örn: CartContext)
        // veya event bus mekanizması gerekebilir. Şimdilik periyodik veya navigasyonla güncellenecek.
        // Veya sepeti etkileyen her işlemden sonra bu component'i yeniden render etmenin bir yolu bulunmalı.
        // Basit bir çözüm: Sepet sayfası dışındaki her navigasyonda tekrar çekmek.
        // Veya AuthContext'e cartItemCount'u ekleyip orada güncellemek.

        // Token veya giriş durumu değiştiğinde tekrar çek
    }, [isAuthenticated, token, navigate]); // navigate bağımlılıklara eklenebilir, sayfa değişimlerinde tetiklemek için.
                                         // Ya da daha iyisi, global bir sepet state'i olduğunda o değiştiğinde tetiklenir.

    const handleLogout = () => {
        logout();
        setCartItemCount(0); // Logout olunca sepet sayısını sıfırla
        navigate('/login');
    };

    const navStyle = {
        background: 'rgba(245, 92, 46, 0.87)', 
        color: '#fff',

        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px',
    };

    const linkStyle = {
        color: '#fff',
        textDecoration: 'none',
        margin: '0 10px',
        fontWeight: 'bold',
    };

    const buttonStyle = {
        background: 'transparent',
        color: '#fff',
        border: '1px solid #fff',
        padding: '5px 10px',
        cursor: 'pointer',
        marginLeft: '10px',
    };

    return (
        <nav style={navStyle}>
            <div>
                <Link to="/" style={linkStyle}>Ana Sayfa</Link>
            </div>
            <div>
                {isAuthenticated() ? (
                    <>
                        <Link to="/cart" style={{...linkStyle, position: 'relative', marginRight: '15px'}}>
                            Sepetim
                            {cartItemCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-12px',
                                    background: 'red',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '2px 6px',
                                    fontSize: '0.8em'
                                }}>
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                        <span style={{ marginRight: '15px' }}>Merhaba, {user?.name}</span>
                        <Link to="/profile" style={linkStyle}>Profilim</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" style={linkStyle}>Admin Paneli</Link>
                        )}
                        <button onClick={handleLogout} style={buttonStyle}>Çıkış Yap</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={linkStyle}>Giriş Yap</Link>
                        <Link to="/register" style={linkStyle}>Kayıt Ol</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;