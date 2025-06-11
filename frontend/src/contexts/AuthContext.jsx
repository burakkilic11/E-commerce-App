import React, { createContext, useState, useEffect, useContext } from 'react';
import { register as apiRegister, login as apiLogin, getProfile as apiGetProfile } from '../services/api'; // api.js'den import

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken') || null);
    const [loading, setLoading] = useState(true); // Başlangıçta kullanıcı bilgilerini yükleme durumu
    const [authError, setAuthError] = useState(null); // Hata mesajlarını tutmak için

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user:", e);
                    localStorage.removeItem('authUser'); // Hatalı veriyi temizle
                }
            }
            // Token varsa, profil bilgisini backend'den çekip kullanıcıyı doğrula (isteğe bağlı ama iyi pratik)
            // Bu, token'ın backend'de hala geçerli olup olmadığını kontrol eder.
            // Şimdilik bu kısmı yoruma alalım, sadece localStorage'a güvenelim.
            /*
            apiGetProfile()
                .then(response => {
                    setUser(response.data);
                    localStorage.setItem('authUser', JSON.stringify(response.data));
                })
                .catch(() => {
                    // Token geçersizse temizle
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
            */
            setLoading(false); // Basit POC için direkt false yapıyoruz
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        setAuthError(null); // Önceki hataları temizle
        try {
            const response = await apiLogin({ email, password });
            const { token: newToken, user: userData } = response.data;
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(userData)); // Kullanıcı bilgilerini de sakla
            return true; // Başarılı giriş
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            setAuthError(error.response?.data?.message || 'Giriş başarısız oldu.');
            return false; // Başarısız giriş
        }
    };

    const register = async (name, email, password) => {
        setAuthError(null);
        try {
            const response = await apiRegister({ name, email, password });
            const { token: newToken, user: userData } = response.data;
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            setAuthError(error.response?.data?.message || 'Kayıt başarısız oldu.');
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setAuthError(null);
        // İsteğe bağlı: Kullanıcıyı ana sayfaya veya login sayfasına yönlendir
        // navigate('/login'); // Eğer react-router-dom'dan useNavigate hook'u kullanılıyorsa
    };

    const isAuthenticated = () => {
        return !!token; // Token varsa kullanıcı kimliği doğrulanmış sayılır
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, loading, authError, setAuthError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};