import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ShoppingCart, User, ChevronDown, Menu, X, Heart } from 'lucide-react';
import { categories } from '../data/mock';

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
      {/* Top Banner */}
      <div className="bg-[#FFE600] text-xs py-1 text-center text-gray-700">
        <span>Frete grátis a partir de R$ 79 | </span>
        <Link to="/" className="text-[#3483FA] hover:underline">Ver condições</Link>
      </div>

      {/* Main Header */}
      <div className="bg-[#FFE600] pb-2">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-4 py-2">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-gray-700"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="text-2xl font-bold text-gray-800 tracking-tight">
                <span className="text-[#3483FA]">Mercado</span>
                <span className="text-gray-800">Livre</span>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:block">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Buscar produtos, marcas e muito mais..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-l-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#3483FA] text-sm"
                />
                <button 
                  type="submit"
                  className="bg-white px-4 rounded-r-sm border-l border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Search size={20} className="text-gray-500" />
                </button>
              </div>
            </form>

            {/* Right Section */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Location */}
              <div className="hidden md:flex items-center gap-1 text-sm text-gray-700 cursor-pointer hover:text-[#3483FA]">
                <MapPin size={16} />
                <div className="leading-tight">
                  <span className="text-xs text-gray-500 block">Enviar para</span>
                  <span className="font-medium">São Paulo</span>
                </div>
              </div>

              {/* Categories Dropdown */}
              <div 
                className="hidden lg:block relative"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#3483FA]">
                  Categorias <ChevronDown size={16} />
                </button>
                {showCategories && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-sm py-2 min-w-[200px] z-50">
                    {categories.slice(0, 8).map(cat => (
                      <Link 
                        key={cat.id}
                        to={`/search?category=${cat.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link 
                      to="/categories"
                      className="block px-4 py-2 text-sm text-[#3483FA] hover:bg-gray-100 border-t mt-2"
                    >
                      Ver todas
                    </Link>
                  </div>
                )}
              </div>

              {/* Favorites */}
              <Link to="/favorites" className="hidden sm:block text-gray-700 hover:text-[#3483FA]">
                <Heart size={22} />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-700 hover:text-[#3483FA]">
                <ShoppingCart size={22} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#3483FA] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
                  <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#3483FA]">
                    <User size={20} />
                    <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showUserMenu && (
                    <div className="absolute top-full right-0 bg-white shadow-lg rounded-sm py-2 min-w-[180px] z-50">
                      <Link to="/my-account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Minha conta
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Minhas compras
                      </Link>
                      <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Favoritos
                      </Link>
                      <button 
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t mt-2"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Link to="/register" className="text-gray-700 hover:text-[#3483FA] hidden sm:inline">
                    Crie sua conta
                  </Link>
                  <Link to="/login" className="text-gray-700 hover:text-[#3483FA]">
                    Entre
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="sm:hidden mt-2">
            <div className="flex">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-l-sm border-0 focus:outline-none text-sm"
              />
              <button 
                type="submit"
                className="bg-white px-4 rounded-r-sm"
              >
                <Search size={20} className="text-gray-500" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Secondary Nav */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4">
          <nav className="flex items-center gap-6 py-2 text-sm overflow-x-auto">
            <Link to="/search?category=tecnologia" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Tecnologia</Link>
            <Link to="/search?category=eletrodomesticos" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Eletrodomésticos</Link>
            <Link to="/search?category=moda" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Moda</Link>
            <Link to="/search?category=esportes" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Esportes</Link>
            <Link to="/deals" className="text-[#3483FA] font-medium whitespace-nowrap">Ofertas do dia</Link>
            <Link to="/" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Histórico</Link>
            <Link to="/" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Supermercado</Link>
            <Link to="/" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Moda</Link>
            <Link to="/" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Vender</Link>
            <Link to="/" className="text-gray-600 hover:text-[#3483FA] whitespace-nowrap">Ajuda</Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Categorias</h3>
            {categories.map(cat => (
              <Link 
                key={cat.id}
                to={`/search?category=${cat.slug}`}
                className="block py-2 text-gray-700 border-b"
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
