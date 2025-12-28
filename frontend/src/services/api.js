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
  },
  trackView: async (productId, sessionId, userId = null) => {
    const response = await api.post(`/products/${productId}/view`, null, {
      params: { session_id: sessionId, user_id: userId }
    });
    return response.data;
  },
  getRelated: async (productId, limit = 8) => {
    const response = await api.get(`/products/${productId}/related`, { params: { limit } });
    return response.data;
  },
  getSuggestions: async (productId, limit = 6) => {
    const response = await api.get(`/products/${productId}/suggestions`, { params: { limit } });
    return response.data;
  },
  getAlsoViewed: async (productId, sessionId, limit = 8) => {
    const response = await api.get(`/products/${productId}/also-viewed`, { 
      params: { session_id: sessionId, limit } 
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

// Blog API
export const blogAPI = {
  getCategories: async () => {
    const response = await api.get('/blog/categories');
    return response.data;
  },
  getPosts: async (params = {}) => {
    const response = await api.get('/blog/posts', { params });
    return response.data;
  },
  getPost: async (slug) => {
    const response = await api.get(`/blog/posts/${slug}`);
    return response.data;
  },
  getComments: async (slug) => {
    const response = await api.get(`/blog/posts/${slug}/comments`);
    return response.data;
  },
  createComment: async (slug, data) => {
    const response = await api.post(`/blog/posts/${slug}/comments`, {
      author_name: data.author,
      author_email: data.email,
      content: data.content
    });
    return response.data;
  },
  getRecentPosts: async (limit = 5) => {
    const response = await api.get('/blog/recent', { params: { limit } });
    return response.data;
  }
};

// Display Settings API
export const displaySettingsAPI = {
  get: async () => {
    const response = await api.get('/display-settings');
    return response.data;
  }
};

export default api;
