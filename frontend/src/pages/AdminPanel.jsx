import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient, { fetchCategories, fetchAllOrders, fetchAdminReports } from '../services/api';

function AdminPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);

    // Ürün ekleme için state'ler
    const [categories, setCategories] = useState([]);
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        category_id: '',
        description: '',
        stock: '',
        image_url: ''
    });
    const [productAddStatus, setProductAddStatus] = useState(null);

    // Raporlar için state
    const [reports, setReports] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await apiClient.get('/admin/users');
                setUsers(res.data);
            } catch (err) {
                setError('Kullanıcılar alınamadı.');
            }
        };
        fetchUsers();
    }, []);

    // Kategorileri çek
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetchCategories();
                setCategories(res.data);
            } catch {
                setCategories([]);
            }
        };
        loadCategories();
    }, []);

    // Siparişleri çek
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetchAllOrders();
                setOrders(res.data);
            } catch {
                setOrders([]);
            }
        };
        fetchOrders();
    }, []);

    // Raporları çek
    useEffect(() => {
        const loadReports = async () => {
            try {
                const res = await fetchAdminReports();
                setReports(res.data);
            } catch {
                setReports(null);
            }
        };
        loadReports();
    }, []);

    const makeAdmin = async (id) => {
        if (!window.confirm('Bu kullanıcıyı admin yapmak istediğinize emin misiniz?')) return;
        try {
            await apiClient.post(`/admin/users/${id}/make-admin`);
            setUsers(users.map(u => u.id === id ? { ...u, role: 'admin' } : u));
        } catch {
            alert('Rol güncellenemedi.');
        }
    };

    // Ürün ekleme formu submit
    const handleProductFormChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const handleProductAdd = async (e) => {
        e.preventDefault();
        setProductAddStatus(null);
        // Basit validasyon
        if (!productForm.name || !productForm.price || !productForm.category_id || !productForm.stock) {
            setProductAddStatus({ type: 'error', msg: 'Lütfen zorunlu alanları doldurun.' });
            return;
        }
        try {
            await apiClient.post('/products', {
                name: productForm.name,
                price: parseFloat(productForm.price),
                category_id: parseInt(productForm.category_id),
                description: productForm.description,
                stock: parseInt(productForm.stock),
                image_url: productForm.image_url
            });
            setProductAddStatus({ type: 'success', msg: 'Ürün başarıyla eklendi.' });
            setProductForm({ name: '', price: '', category_id: '', description: '', stock: '', image_url: '' });
        } catch (err) {
            setProductAddStatus({ type: 'error', msg: err.response?.data?.message || 'Ürün eklenirken hata oluştu.' });
        }
    };

    if (!user || user.role !== 'admin') return <div>Yetkisiz erişim.</div>;

    return (
        <div style={{maxWidth: 700, margin: '40px auto'}}>
            <h2>Admin Paneli</h2>
            {/* Raporlar Bölümü */}
            <div style={{border: '1px solid #eee', borderRadius: 8, padding: 20, marginBottom: 30, background: '#f8f9fa'}}>
                <h3>Raporlar</h3>
                {!reports ? (
                    <div>Raporlar yükleniyor...</div>
                ) : (
                    <div style={{display: 'flex', gap: 30, flexWrap: 'wrap'}}>
                        <div>
                            <b>Kullanıcı Sayısı:</b><br />{reports.userCount}
                        </div>
                        <div>
                            <b>Sipariş Sayısı:</b><br />{reports.orderCount}
                        </div>
                        <div>
                            <b>Toplam Ciro:</b><br />{Number(reports.totalRevenue).toFixed(2)} TL
                        </div>
                        <div>
                            <b>En Çok Satan Ürünler:</b>
                            <ol>
                                {reports.bestSellers.map(p => (
                                    <li key={p.id}>{p.name} ({p.total_sold} adet)</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}
            </div>
            {/* Ürün Ekleme Formu */}
            <div style={{border: '1px solid #ccc', borderRadius: 8, padding: 20, marginBottom: 30}}>
                <h3>Yeni Ürün Ekle</h3>
                <form onSubmit={handleProductAdd}>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
                        <div style={{flex: '1 1 200px'}}>
                            <label>Ürün Adı*<br/>
                                <input
                                    name="name"
                                    value={productForm.name}
                                    onChange={handleProductFormChange}
                                    required
                                    style={{width: '100%', background: '#fff', color: '#000'}}
                                />
                            </label>
                        </div>
                        <div style={{flex: '1 1 100px'}}>
                            <label>Fiyat (₺)*<br/>
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={productForm.price}
                                    onChange={handleProductFormChange}
                                    required
                                    style={{width: '100%', background: '#fff', color: '#000'}}
                                />
                            </label>
                        </div>
                        <div style={{flex: '1 1 120px'}}>
                            <label>Kategori*<br/>
                                <select
                                    name="category_id"
                                    value={productForm.category_id}
                                    onChange={handleProductFormChange}
                                    required
                                    style={{width: '100%', background: '#fff', color: '#000'}}
                                >
                                    <option value="">Seçiniz</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div style={{flex: '1 1 80px'}}>
                            <label>Stok*<br/>
                                <input
                                    name="stock"
                                    type="number"
                                    value={productForm.stock}
                                    onChange={handleProductFormChange}
                                    required
                                    style={{width: '100%', background: '#fff', color: '#000'}}
                                />
                            </label>
                        </div>
                        <div style={{flex: '1 1 100%'}}>
                            <label>Açıklama<br/>
                                <textarea
                                    name="description"
                                    value={productForm.description}
                                    onChange={handleProductFormChange}
                                    rows={2}
                                    style={{width: '100%', background: '#fff', color: '#000'}}
                                />
                            </label>
                        </div>
                        <div style={{flex: '1 1 100%'}}>
                            <label>Görsel URL<br/>
                                <input
                                    name="image_url"
                                    value={productForm.image_url}
                                    onChange={handleProductFormChange}
                                    style={{width: '100%', background: '#fff', color: '#000'}}
                                />
                            </label>
                        </div>
                    </div>
                    <button type="submit" style={{marginTop: 16, background: '#28a745', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4}}>Ürün Ekle</button>
                    {productAddStatus && (
                        <span style={{marginLeft: 16, color: productAddStatus.type === 'success' ? 'green' : 'red'}}>
                            {productAddStatus.msg}
                        </span>
                    )}
                </form>
            </div>
            {/* Kullanıcı Listesi */}
            <table border="1" cellPadding="8" style={{width: '100%', marginTop: 20}}>
                <thead>
                    <tr>
                        <th>ID</th><th>İsim</th><th>Email</th><th>Rol</th><th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                                {u.role !== 'admin' && (
                                    <button onClick={() => makeAdmin(u.id)}>Admin Yap</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr style={{margin: '40px 0'}} />
            <h3>Tüm Siparişler</h3>
            {orders.length === 0 ? (
                <p>Henüz sipariş yok.</p>
            ) : (
                <table border="1" cellPadding="6" style={{width: '100%', marginTop: 10, fontSize: '0.95em'}}>
                    <thead>
                        <tr>
                            <th>Sipariş No</th>
                            <th>Kullanıcı</th>
                            <th>Adres</th>
                            <th>Tutar</th>
                            <th>Tarih</th>
                            <th>Ürünler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.user_name} (ID: {order.user_id})</td>
                                <td>{order.shipping_address}</td>
                                <td>{order.total_amount.toFixed(2)} TL</td>
                                <td>{new Date(order.created_at).toLocaleString()}</td>
                                <td>
                                    <ul style={{margin: 0, paddingLeft: 16}}>
                                        {order.items.map(item => (
                                            <li key={item.product_id}>
                                                {item.name} x {item.quantity} ({item.price_at_purchase.toFixed(2)} TL)
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminPanel;