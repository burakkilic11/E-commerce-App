import axios from 'axios';

// .env dosyasından API base URL'ini al
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// İstek interceptor'ı: Her isteğe token eklemek için
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Token'ı localStorage'dan al
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Yanıt interceptor'ı: 401 (Unauthorized) hatası durumunda kullanıcıyı logout yapabiliriz (opsiyonel)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token geçersiz veya süresi dolmuş olabilir.
            // Kullanıcıyı logout yapıp login sayfasına yönlendirebiliriz.
            console.warn('Unauthorized request, logging out...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser'); // Kullanıcı bilgilerini de temizle
            // window.location.href = '/login'; // Sayfayı yeniden yükleyerek yönlendir
            // Veya React Router'ın history objesi ile yönlendirme yapılabilir.
            // Bu kısım AuthContext içinde yönetilebilir.
        }
        return Promise.reject(error);
    }
);


// Auth servis fonksiyonları
export const register = (userData) => apiClient.post('/auth/register', userData);
export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const getProfile = () => apiClient.get('/auth/profile');

// Diğer servis fonksiyonları buraya eklenecek (ürünler, kategoriler vb.)
// Category servis fonksiyonları
export const fetchCategories = () => apiClient.get('/categories');

// Product servis fonksiyonları
/**
 * Ürünleri getirir.
 * @param {object} params - Query parametreleri (örn: { categoryId, page, limit })
 */
export const fetchProducts = (params) => apiClient.get('/products', { params });
export const fetchProductById = (productId) => apiClient.get(`/products/${productId}`);
// export const getProducts = () => apiClient.get('/products');
// Cart servis fonksiyonları
export const getCart = () => apiClient.get('/cart');
export const addItemToCartApi = (itemData) => apiClient.post('/cart', itemData); // itemData: { productId, quantity }
export const updateCartItemQuantityApi = (cartItemId, quantityData) => apiClient.put(`/cart/${cartItemId}`, quantityData); // quantityData: { quantity }
export const removeCartItemApi = (cartItemId) => apiClient.delete(`/cart/${cartItemId}`);
export const clearCartApi = () => apiClient.delete('/cart/clear');

// Order servis fonksiyonları (şemaya uygun)
export const createOrderApi = (orderData) => apiClient.post('/orders', orderData); // orderData: { shipping_address }
export const fetchMyOrders = () => apiClient.get('/orders/my');
export const fetchAllOrders = () => apiClient.get('/orders');

// Admin rapor servis fonksiyonu
export const fetchAdminReports = () => apiClient.get('/admin/reports');

export default apiClient; // İsterseniz direkt axios instance'ını da export edebilirsiniz