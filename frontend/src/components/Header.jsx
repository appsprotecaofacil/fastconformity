import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ShoppingCart, User, ChevronDown, Menu, X, Heart } from 'lucide-react';
import { categories } from '../data/mock';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const Header = ({ cartItemsCount = 0, user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header - Gradiente Moderno */}
      <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}>
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white/80 hover:text-white"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="text-2xl font-bold text-white tracking-tight">
                Fast<span style={{ color: colors.accent }}>Conformity</span>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:bg-white/20 text-white placeholder-white/70 text-sm transition-colors"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Right Section */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Location */}
              <div className="hidden md:flex items-center gap-2 text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
                <MapPin size={18} />
                <span>São Paulo</span>
              </div>

              {/* Categories Dropdown */}
              <div 
                className="hidden lg:block relative"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <button className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors">
                  Categorias <ChevronDown size={16} />
                </button>
                {showCategories && (
                  <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl py-2 min-w-[200px] z-50 mt-2 border border-gray-100">
                    {categories.slice(0, 8).map(cat => (
                      <Link 
                        key={cat.id}
                        to={`/search?category=${cat.slug}`}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1E3A5F] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link 
                      to="/categories"
                      className="block px-4 py-2.5 text-sm font-medium border-t mt-2 transition-colors hover:bg-gray-50"
                      style={{ color: colors.accent }}
                    >
                      Ver todas
                    </Link>
                  </div>
                )}
              </div>

              {/* Favorites */}
              <Link 
                to="/favorites" 
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Heart size={22} />
              </Link>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ShoppingCart size={22} />
                {cartItemsCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: colors.accent }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div 
                  className="relative"
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium border border-white/30 hover:bg-white/10 transition-colors">
                    <User size={18} />
                    <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showUserMenu && (
                    <div className="absolute top-full right-0 bg-white shadow-xl rounded-xl py-2 min-w-[180px] z-50 mt-2 border border-gray-100">
                      <Link to="/my-account" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Minha conta
                      </Link>
                      <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Minhas compras
                      </Link>
                      <Link to="/favorites" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Favoritos
                      </Link>
                      <button 
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t mt-2 transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium border border-white/30 hover:bg-white/10 transition-colors"
                >
                  <User size={18} />
                  Entrar
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="sm:hidden mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:bg-white/20 text-white placeholder-white/70 text-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white"
                style={{ backgroundColor: colors.accent }}
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 top-[80px] bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Categorias</h3>
            {categories.map(cat => (
              <Link 
                key={cat.id}
                to={`/search?category=${cat.slug}`}
                className="block py-3 text-gray-700 border-b border-gray-100 hover:text-[#1E3A5F] transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
