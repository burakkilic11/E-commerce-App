import React, { useEffect } from 'react'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
    const { isAuthenticated, logout, user, cartItemCount, refreshCartItemCount } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Sayfa değiştiğinde (özellikle /cart veya /) sepet sayısını güncelle
    useEffect(() => {
        if (isAuthenticated()) {
            refreshCartItemCount();
        }
    // eslint-disable-next-line
    }, [location.pathname, isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navStyle = {
        background: 'rgba(245, 92, 46, 0.87)', 
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed', // Sabit üstte tut
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        boxSizing: 'border-box'
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