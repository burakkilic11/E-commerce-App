import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile as apiGetProfileData, fetchMyOrders } from '../services/api';

function ProfilePage() {
    const { user: authContextUser, token, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (token && !authLoading) {
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
            } else if (!token && !authLoading) {
                setError('Lütfen giriş yapınız.');
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchProfile();
        }
    }, [token, authLoading]);

    // Siparişleri yükle
    useEffect(() => {
        if (!authLoading && token) {
            fetchMyOrders()
                .then(res => setOrders(res.data))
                .catch(() => setOrders([]));
        }
    }, [token, authLoading]);

    // Yükleniyor takılmasını engelle: loading sadece profil yüklenirken true olmalı
    if (authLoading) {
        return <div style={{padding: '20px', textAlign: 'center'}}>Yükleniyor...</div>;
    }
    if (loading) {
        return <div style={{padding: '20px', textAlign: 'center'}}>Yükleniyor...</div>;
    }
    if (error) {
        return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Hata: {error}</div>;
    }
    if (!profileData && !authContextUser) {
        return <div style={{padding: '20px', textAlign: 'center'}}>Giriş yapmanız gerekmektedir.</div>;
    }

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
            <hr style={{margin: '30px 0'}} />
            <h3>Siparişlerim</h3>
            {orders.length === 0 ? (
                <p>Henüz siparişiniz yok.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id} style={{marginBottom: 16, border: '1px solid #eee', borderRadius: 6, padding: 10}}>
                            <div><b>Sipariş No:</b> {order.id} <b>Tarih:</b> {new Date(order.created_at).toLocaleString()}</div>
                            <div><b>Adres:</b> {order.shipping_address}</div>
                            <div><b>Tutar:</b> {order.total_amount.toFixed(2)} TL</div>
                            <div>
                                <b>Ürünler:</b>
                                <ul>
                                    {order.items.map(item => (
                                        <li key={item.product_id}>
                                            {item.name} x {item.quantity} ({item.price_at_purchase.toFixed(2)} TL)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProfilePage;