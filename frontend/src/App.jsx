import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProductDetailPage from './pages/ProductDetailPage'; // ProductDetailPage'i import et
import './App.css';
import CartPage from './pages/CartPage'; // CartPage'i import et
import AdminPanel from './pages/AdminPanel';

function App() {
    return (
        <>
            <Navbar />
            <div className="container" style={{padding: '20px', paddingTop: '80px'}}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} /> {/* Yeni rota */}
                    
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/cart" element={<CartPage />} /> {/* Yeni Korumalı Rota */}
                        {/** Sadece admin kullanıcılar için */}
                        <Route path="/admin" element={
                            <AdminPanel />
                        } />
                    </Route>

                    <Route path="*" element={<div style={{textAlign: 'center'}}><h1>404 - Sayfa Bulunamadı</h1></div>} />
                 </Routes>
            </div>
        </>
    );
}

export default App;