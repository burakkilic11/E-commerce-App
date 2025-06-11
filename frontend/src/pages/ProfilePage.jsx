import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile as apiGetProfileData } from '../services/api'; // api.js'den import

function ProfilePage() {
    const { user: authContextUser, token, loading: authLoading } = useAuth(); // AuthContext'ten gelen kullanıcıyı alalım
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (token && !authLoading) { // Token varsa ve AuthContext yüklenmesi bittiyse
                try {
                    const response = await apiGetProfileData();
                    setProfileData(response.data);
                    setError(null);
                } catch (err) {
                    setError(err.response?.data?.message || 'Profil bilgileri alınamadı.');
                    console.error("Profile fetch error:", err);
                } finally {
                    setLoading(false);
                }
            } else if (!token && !authLoading) { // Token yoksa ve AuthContext yüklenmesi bittiyse
                setError('Lütfen giriş yapınız.');
                setLoading(false);
            }
        };

        if(!authLoading) { // AuthContext'in ilk yüklemesi bittikten sonra çalıştır
           fetchProfile();
        }

    }, [token, authLoading]); // Token veya authLoading değiştiğinde useEffect'i tekrar çalıştır

    if (authLoading || loading) {
        return <div style={{padding: '20px', textAlign: 'center'}}>Yükleniyor...</div>;
    }

    if (error) {
        return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Hata: {error}</div>;
    }

    if (!profileData && !authContextUser) { // Ne backend'den ne de context'ten kullanıcı bilgisi yoksa
        return <div style={{padding: '20px', textAlign: 'center'}}>Giriş yapmanız gerekmektedir.</div>;
    }

    // Tercihen backend'den gelen taze veriyi kullan, yoksa context'tekini.
    const displayUser = profileData || authContextUser;

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>Profilim</h2>
            {displayUser ? (
                <>
                    <p><strong>ID:</strong> {displayUser.id}</p>
                    <p><strong>İsim:</strong> {displayUser.name}</p>
                    <p><strong>E-posta:</strong> {displayUser.email}</p>
                    <p><strong>Rol:</strong> {displayUser.role}</p>
                    <p><strong>Kayıt Tarihi:</strong> {displayUser.created_at ? new Date(displayUser.created_at).toLocaleDateString() : 'N/A'}</p>
                </>
            ) : (
                <p>Kullanıcı bilgileri yüklenemedi.</p>
            )}
        </div>
    );
}

export default ProfilePage;