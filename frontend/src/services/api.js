import axios from 'axios';

// Creating a custom instance for Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  }
};

// Customer Services
export const customerService = {
  getAll: (params) => api.get('/customers', { params }).then(res => res.data),
  getById: (id) => api.get(`/customers/${id}`).then(res => res.data),
  create: (data) => api.post('/customers', data).then(res => res.data),
  update: (id, data) => api.put(`/customers/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/customers/${id}`).then(res => res.data),
};

// Product Services
export const productService = {
  getAll: (params) => api.get('/products', { params }).then(res => res.data),
  getLowStock: (threshold = 10) => api.get('/products/low-stock', { params: { threshold } }).then(res => res.data),
  getById: (id) => api.get(`/products/${id}`).then(res => res.data),
  create: (data) => api.post('/products', data).then(res => res.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/products/${id}`).then(res => res.data),
};

// Order Services
export const orderService = {
  getAll: (params) => api.get('/orders', { params }).then(res => res.data),
  getById: (id) => api.get(`/orders/${id}`).then(res => res.data),
  create: (data) => api.post('/orders', data).then(res => res.data),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { order_status: status }).then(res => res.data),
  getSalesStats: (params) => api.get('/orders/stats/sales', { params }).then(res => res.data),
};

// Inventory Services
export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }).then(res => res.data),
  getSummary: () => api.get('/inventory/summary').then(res => res.data),
  create: (data) => api.post('/inventory', data).then(res => res.data),
  update: (id, data) => api.put(`/inventory/${id}`, data).then(res => res.data),
  updateStock: (id, data) => api.post(`/inventory/${id}/update-stock`, data).then(res => res.data),
  transferStock: (data) => api.post('/inventory/transfer', data).then(res => res.data),
  delete: (id) => api.delete(`/inventory/${id}`).then(res => res.data),
};

// Warehouse Services
export const warehouseService = {
  getAll: () => api.get('/warehouses').then(res => res.data),
  getById: (id) => api.get(`/warehouses/${id}`).then(res => res.data),
  create: (data) => api.post('/warehouses', data).then(res => res.data),
  update: (id, data) => api.put(`/warehouses/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/warehouses/${id}`).then(res => res.data),
};

export default api;
