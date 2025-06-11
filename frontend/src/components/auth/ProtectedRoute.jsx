import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div style={{padding: '20px', textAlign: 'center'}}>Yükleniyor...</div>; // Auth durumu kontrol edilirken bekleme ekranı
    }

    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;