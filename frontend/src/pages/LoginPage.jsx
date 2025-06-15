import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, authError, setAuthError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError(null); // Form gönderildiğinde önceki hataları temizle
        const success = await login(email, password);
        if (success) {
            navigate('/'); // Başarılı giriş sonrası ana sayfaya yönlendir
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">E-posta:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#f2f3ee', color: '#333', borderRadius: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Şifre:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box',backgroundColor: '#f2f3ee', color: '#333', borderRadius: '8px' }}
                    />
                </div>
                {authError && <p style={{ color: 'red' }}>{authError}</p>}
                <button type="submit" style={{ padding: '10px 15px', backgroundColor: 'rgba(221, 102, 47, 0.88)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                    Giriş Yap
                </button>
            </form>
            <p style={{ marginTop: '20px' }}>
                Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
            </p>
        </div>
    );
}

export default LoginPage;