import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/admin`;

const adminApi = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dashboard
export const dashboardAPI = {
  getStats: async () => {
    const response = await adminApi.get('/dashboard/stats');
    return response.data;
  }
};

// Auth
export const adminAuthAPI = {
  login: async (email, password) => {
    const response = await adminApi.post('/login', { email, password });
    return response.data;
  }
};

// Products
export const adminProductsAPI = {
  getAll: async (params = {}) => {
    const response = await adminApi.get('/products', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await adminApi.get(`/products/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await adminApi.post('/products', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await adminApi.put(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/products/${id}`);
    return response.data;
  }
};

// Categories
export const adminCategoriesAPI = {
  getAll: async () => {
    const response = await adminApi.get('/categories');
    return response.data;
  },
  getTree: async () => {
    const response = await adminApi.get('/categories/tree');
    return response.data;
  },
  getParents: async () => {
    const response = await adminApi.get('/categories/parents');
    return response.data;
  },
  create: async (data) => {
    const response = await adminApi.post('/categories', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await adminApi.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/categories/${id}`);
    return response.data;
  }
};

// Users
export const adminUsersAPI = {
  getAll: async (params = {}) => {
    const response = await adminApi.get('/users', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await adminApi.get(`/users/${id}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/users/${id}`);
    return response.data;
  }
};

// Orders
export const adminOrdersAPI = {
  getAll: async (params = {}) => {
    const response = await adminApi.get('/orders', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await adminApi.get(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await adminApi.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};

// Reviews
export const adminReviewsAPI = {
  getAll: async (params = {}) => {
    const response = await adminApi.get('/reviews', { params });
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/reviews/${id}`);
    return response.data;
  }
};

// Admins
export const adminAdminsAPI = {
  getAll: async () => {
    const response = await adminApi.get('/admins');
    return response.data;
  },
  create: async (data) => {
    const response = await adminApi.post('/admins', data);
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/admins/${id}`);
    return response.data;
  }
};

export default adminApi;
