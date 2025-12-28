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

// Quotes
export const adminQuotesAPI = {
  getAll: async (params = {}) => {
    const response = await adminApi.get('/quotes', { params });
    return response.data;
  },
  getStats: async () => {
    const response = await adminApi.get('/quotes/stats');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await adminApi.put(`/quotes/${id}/status`, { status });
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/quotes/${id}`);
    return response.data;
  }
};

// Blog Categories
export const adminBlogCategoriesAPI = {
  getAll: async () => {
    const response = await adminApi.get('/blog/categories');
    return response.data;
  },
  create: async (data) => {
    const response = await adminApi.post('/blog/categories', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await adminApi.put(`/blog/categories/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/blog/categories/${id}`);
    return response.data;
  }
};

// Blog Posts
export const adminBlogPostsAPI = {
  getAll: async (params = {}) => {
    const response = await adminApi.get('/blog/posts', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await adminApi.get(`/blog/posts/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await adminApi.post('/blog/posts', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await adminApi.put(`/blog/posts/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/blog/posts/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await adminApi.get('/blog/stats');
    return response.data;
  }
};

// Blog Comments
export const adminBlogCommentsAPI = {
  getAll: async (params = {}) => {
    const response = await adminApi.get('/blog/comments', { params });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await adminApi.put(`/blog/comments/${id}/status?status=${status}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await adminApi.delete(`/blog/comments/${id}`);
    return response.data;
  }
};

// Display Settings
export const adminDisplaySettingsAPI = {
  getAll: async () => {
    const response = await adminApi.get('/display-settings');
    return response.data;
  },
  update: async (data) => {
    const response = await adminApi.put('/display-settings', data);
    return response.data;
  },
  getProductOverrides: async (productId) => {
    const response = await adminApi.get(`/display-settings/product/${productId}`);
    return response.data;
  },
  updateProductOverrides: async (productId, overrides) => {
    const response = await adminApi.put(`/display-settings/product/${productId}`, overrides);
    return response.data;
  }
};

// Home Management API
export const adminHomeAPI = {
  // Sections
  getSections: async () => {
    const response = await adminApi.get('/home/sections');
    return response.data;
  },
  updateSection: async (id, data) => {
    const response = await adminApi.put(`/home/sections/${id}`, data);
    return response.data;
  },
  reorderSections: async (order) => {
    const response = await adminApi.put('/home/sections/reorder', order);
    return response.data;
  },
  
  // Hero Slides
  getHeroSlides: async () => {
    const response = await adminApi.get('/home/hero-slides');
    return response.data;
  },
  createHeroSlide: async (data) => {
    const response = await adminApi.post('/home/hero-slides', data);
    return response.data;
  },
  updateHeroSlide: async (id, data) => {
    const response = await adminApi.put(`/home/hero-slides/${id}`, data);
    return response.data;
  },
  deleteHeroSlide: async (id) => {
    const response = await adminApi.delete(`/home/hero-slides/${id}`);
    return response.data;
  },
  
  // Carousels
  getCarousels: async () => {
    const response = await adminApi.get('/home/carousels');
    return response.data;
  },
  createCarousel: async (data) => {
    const response = await adminApi.post('/home/carousels', data);
    return response.data;
  },
  updateCarousel: async (id, data) => {
    const response = await adminApi.put(`/home/carousels/${id}`, data);
    return response.data;
  },
  deleteCarousel: async (id) => {
    const response = await adminApi.delete(`/home/carousels/${id}`);
    return response.data;
  },
  
  // Banners
  getBanners: async () => {
    const response = await adminApi.get('/home/banners');
    return response.data;
  },
  createBanner: async (data) => {
    const response = await adminApi.post('/home/banners', data);
    return response.data;
  },
  updateBanner: async (id, data) => {
    const response = await adminApi.put(`/home/banners/${id}`, data);
    return response.data;
  },
  deleteBanner: async (id) => {
    const response = await adminApi.delete(`/home/banners/${id}`);
    return response.data;
  },
  
  // Content Blocks
  getContentBlocks: async () => {
    const response = await adminApi.get('/home/content-blocks');
    return response.data;
  },
  createContentBlock: async (data) => {
    const response = await adminApi.post('/home/content-blocks', data);
    return response.data;
  },
  updateContentBlock: async (id, data) => {
    const response = await adminApi.put(`/home/content-blocks/${id}`, data);
    return response.data;
  },
  deleteContentBlock: async (id) => {
    const response = await adminApi.delete(`/home/content-blocks/${id}`);
    return response.data;
  },
  
  // Settings
  getSettings: async () => {
    const response = await adminApi.get('/home/settings');
    return response.data;
  },
  updateSettings: async (data) => {
    const response = await adminApi.put('/home/settings', data);
    return response.data;
  }
};

// Footer Management API
export const adminFooterAPI = {
  // Settings
  getSettings: async () => {
    const response = await adminApi.get('/footer/settings');
    return response.data;
  },
  updateSettings: async (data) => {
    const response = await adminApi.put('/footer/settings', data);
    return response.data;
  },
  
  // Social Links
  getSocialLinks: async () => {
    const response = await adminApi.get('/footer/social-links');
    return response.data;
  },
  createSocialLink: async (data) => {
    const response = await adminApi.post('/footer/social-links', data);
    return response.data;
  },
  updateSocialLink: async (id, data) => {
    const response = await adminApi.put(`/footer/social-links/${id}`, data);
    return response.data;
  },
  deleteSocialLink: async (id) => {
    const response = await adminApi.delete(`/footer/social-links/${id}`);
    return response.data;
  },
  
  // Columns
  getColumns: async () => {
    const response = await adminApi.get('/footer/columns');
    return response.data;
  },
  createColumn: async (data) => {
    const response = await adminApi.post('/footer/columns', data);
    return response.data;
  },
  updateColumn: async (id, data) => {
    const response = await adminApi.put(`/footer/columns/${id}`, data);
    return response.data;
  },
  deleteColumn: async (id) => {
    const response = await adminApi.delete(`/footer/columns/${id}`);
    return response.data;
  },
  
  // Links
  createLink: async (data) => {
    const response = await adminApi.post('/footer/links', data);
    return response.data;
  },
  updateLink: async (id, data) => {
    const response = await adminApi.put(`/footer/links/${id}`, data);
    return response.data;
  },
  deleteLink: async (id) => {
    const response = await adminApi.delete(`/footer/links/${id}`);
    return response.data;
  },
  
  // Payment Methods
  getPaymentMethods: async () => {
    const response = await adminApi.get('/footer/payment-methods');
    return response.data;
  },
  updatePaymentMethod: async (id, data) => {
    const response = await adminApi.put(`/footer/payment-methods/${id}`, data);
    return response.data;
  },
  
  // Security Badges
  getSecurityBadges: async () => {
    const response = await adminApi.get('/footer/security-badges');
    return response.data;
  },
  createSecurityBadge: async (data) => {
    const response = await adminApi.post('/footer/security-badges', data);
    return response.data;
  },
  updateSecurityBadge: async (id, data) => {
    const response = await adminApi.put(`/footer/security-badges/${id}`, data);
    return response.data;
  },
  deleteSecurityBadge: async (id) => {
    const response = await adminApi.delete(`/footer/security-badges/${id}`);
    return response.data;
  }
};

export default adminApi;
