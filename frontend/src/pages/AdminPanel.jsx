import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

function AdminPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

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

    const makeAdmin = async (id) => {
        if (!window.confirm('Bu kullanıcıyı admin yapmak istediğinize emin misiniz?')) return;
        try {
            await apiClient.post(`/admin/users/${id}/make-admin`);
            setUsers(users.map(u => u.id === id ? { ...u, role: 'admin' } : u));
        } catch {
            alert('Rol güncellenemedi.');
        }
    };

    if (!user || user.role !== 'admin') return <div>Yetkisiz erişim.</div>;

    return (
        <div style={{maxWidth: 700, margin: '40px auto'}}>
            <h2>Admin Paneli</h2>
            {error && <div style={{color: 'red'}}>{error}</div>}
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
        </div>
    );
}

export default AdminPanel;