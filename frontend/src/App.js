import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import AdminApp from './admin/AdminApp';
import { authAPI, cartAPI } from './services/api';

// Create Cart Context
export const CartContext = createContext();

// Create Auth Context
export const AuthContext = createContext();

export const useCart = () => useContext(CartContext);
export const useAuth = () => useContext(AuthContext);

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token on mount
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Cart Provider
const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart from API when user is logged in
  const fetchCart = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await cartAPI.get();
        const items = data.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          ...item.product
        }));
        setCartItems(items);
        setCartTotal(data.total);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Use localStorage for guests
      const saved = localStorage.getItem('guestCart');
      if (saved) {
        const items = JSON.parse(saved);
        setCartItems(items);
        setCartTotal(items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user && cartItems.length >= 0) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        await cartAPI.add(product.id, quantity);
        await fetchCart();
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      // Guest cart
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === product.id);
        if (existingItem) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (user) {
      try {
        await cartAPI.remove(cartItemId);
        await fetchCart();
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    if (user) {
      try {
        await cartAPI.update(cartItemId, quantity);
        await fetchCart();
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await cartAPI.clear();
        setCartItems([]);
        setCartTotal(0);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('guestCart');
    }
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemsCount,
      loading,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={
          <AuthProvider>
            <CartProviderWrapper />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

// Separate wrapper to use auth context in cart provider
function CartProviderWrapper() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

function AppContent() {
  const { cartItemsCount } = useCart();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBEBEB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex flex-col">
      <Header cartItemsCount={cartItemsCount} user={user} onLogout={logout} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/deals" element={<SearchPage deals />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
