import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with base config
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  search: async (query, filters = {}) => {
    const response = await api.get('/products', { 
      params: { search: query, ...filters } 
    });
    return response.data;
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

// Cart API
export const cartAPI = {
  get: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  add: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { product_id: productId, quantity });
    return response.data;
  },
  update: async (cartId, quantity) => {
    const response = await api.put(`/cart/${cartId}`, { quantity });
    return response.data;
  },
  remove: async (cartId) => {
    const response = await api.delete(`/cart/${cartId}`);
    return response.data;
  },
  clear: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  create: async () => {
    const response = await api.post('/orders');
    return response.data;
  }
};

// Reviews API
export const reviewsAPI = {
  getByProduct: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  }
};

// Quotes API
export const quotesAPI = {
  create: async (data) => {
    const response = await api.post('/quotes', data);
    return response.data;
  },
  getMyQuotes: async () => {
    const response = await api.get('/quotes');
    return response.data;
  }
};

export default api;
