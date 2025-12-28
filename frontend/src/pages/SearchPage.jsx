import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import { ChevronDown, ChevronUp, Grid, List, SlidersHorizontal, X } from 'lucide-react';

const conditions = [
  { value: 'novo', label: 'Novo' },
  { value: 'usado', label: 'Usado' }
];

const brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Acer', 'Brastemp', 'Amazon', 'Nespresso', 'Caloi'];

const SearchPage = ({ deals = false }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    category: categorySlug,
    condition: '',
    brand: [],
    priceMin: '',
    priceMax: '',
    freeShipping: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    condition: true,
    brand: true,
    price: true
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsAPI.getAll({
            search: query || undefined,
            category: categorySlug || undefined,
            sort: sortBy
          }),
          categoriesAPI.getAll()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query, categorySlug, sortBy]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: categorySlug }));
  }, [categorySlug]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by deals
    if (deals) {
      result = result.filter(p => p.discount >= 15);
    }

    // Filter by category (client-side if not from URL)
    if (filters.category && !categorySlug) {
      result = result.filter(p => p.category === filters.category);
    }

    // Filter by condition
    if (filters.condition) {
      result = result.filter(p => p.condition === filters.condition);
    }

    // Filter by brands
    if (filters.brand.length > 0) {
      result = result.filter(p => filters.brand.includes(p.brand));
    }

    // Filter by price
    if (filters.priceMin) {
      result = result.filter(p => p.price >= parseFloat(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter(p => p.price <= parseFloat(filters.priceMax));
    }

    // Filter by free shipping
    if (filters.freeShipping) {
      result = result.filter(p => p.freeShipping);
    }

    return result;
  }, [products, filters, deals, categorySlug]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleBrand = (brand) => {
    setFilters(prev => ({
      ...prev,
      brand: prev.brand.includes(brand)
        ? prev.brand.filter(b => b !== brand)
        : [...prev.brand, brand]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      brand: [],
      priceMin: '',
      priceMax: '',
      freeShipping: false
    });
  };

  const currentCategory = categories.find(c => c.slug === filters.category);
  const pageTitle = deals ? 'Ofertas do dia' : (query ? `Resultados para "${query}"` : (currentCategory?.name || 'Todos os produtos'));

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#3483FA]">Início</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{pageTitle}</span>
      </nav>

      {/* Page Title & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{pageTitle}</h1>
          <p className="text-sm text-gray-500">{filteredProducts.length} resultados</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Mobile Filter Toggle */}
          <button 
            className="md:hidden flex items-center gap-2 text-sm text-gray-600 border rounded px-3 py-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filtros
          </button>

          {/* Sort Dropdown */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
          >
            <option value="relevance">Mais relevantes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="rating">Melhor avaliados</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center gap-1 border rounded">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid size={18} className="text-gray-600" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={`
          fixed md:static inset-0 z-50 bg-white md:bg-transparent
          transform ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-transform duration-300 md:transition-none
          w-[280px] md:w-[220px] flex-shrink-0 overflow-y-auto
        `}>
          <div className="p-4 md:p-0">
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h3 className="font-semibold text-gray-800">Filtros</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Clear Filters */}
            {(filters.category || filters.condition || filters.brand.length > 0 || filters.priceMin || filters.priceMax || filters.freeShipping) && (
              <button 
                onClick={clearFilters}
                className="text-sm text-[#3483FA] hover:underline mb-4"
              >
                Limpar filtros
              </button>
            )}

            {/* Free Shipping */}
            <div className="mb-4 pb-4 border-b">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={filters.freeShipping}
                  onChange={(e) => setFilters(prev => ({ ...prev, freeShipping: e.target.checked }))}
                  className="rounded text-[#3483FA] focus:ring-[#3483FA]"
                />
                <span className="text-sm text-gray-700">Frete grátis</span>
              </label>
            </div>

            {/* Category Filter */}
            <div className="mb-4 pb-4 border-b">
              <button 
                onClick={() => toggleSection('category')}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="font-medium text-gray-800">Categoria</span>
                {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.category && (
                <ul className="mt-2 space-y-1">
                  <li>
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                      className={`text-sm ${!filters.category ? 'text-[#3483FA] font-medium' : 'text-gray-600 hover:text-[#3483FA]'}`}
                    >
                      Todas
                    </button>
                  </li>
                  {categories.slice(0, 8).map(cat => (
                    <li key={cat.id}>
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, category: cat.slug }))}
                        className={`text-sm ${filters.category === cat.slug ? 'text-[#3483FA] font-medium' : 'text-gray-600 hover:text-[#3483FA]'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Condition Filter */}
            <div className="mb-4 pb-4 border-b">
              <button 
                onClick={() => toggleSection('condition')}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="font-medium text-gray-800">Condição</span>
                {expandedSections.condition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.condition && (
                <ul className="mt-2 space-y-1">
                  <li>
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, condition: '' }))}
                      className={`text-sm ${!filters.condition ? 'text-[#3483FA] font-medium' : 'text-gray-600 hover:text-[#3483FA]'}`}
                    >
                      Todas
                    </button>
                  </li>
                  {conditions.map(cond => (
                    <li key={cond.value}>
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, condition: cond.value }))}
                        className={`text-sm ${filters.condition === cond.value ? 'text-[#3483FA] font-medium' : 'text-gray-600 hover:text-[#3483FA]'}`}
                      >
                        {cond.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Brand Filter */}
            <div className="mb-4 pb-4 border-b">
              <button 
                onClick={() => toggleSection('brand')}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="font-medium text-gray-800">Marca</span>
                {expandedSections.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.brand && (
                <ul className="mt-2 space-y-1">
                  {brands.map(brand => (
                    <li key={brand}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={filters.brand.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded text-[#3483FA] focus:ring-[#3483FA]"
                        />
                        <span className="text-sm text-gray-600">{brand}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <button 
                onClick={() => toggleSection('price')}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="font-medium text-gray-800">Preço</span>
                {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.price && (
                <div className="mt-2 flex gap-2">
                  <input 
                    type="number"
                    placeholder="Mín"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number"
                    placeholder="Máx"
                    value={filters.priceMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                  />
                </div>
              )}
            </div>

            {/* Mobile Apply Button */}
            <button 
              onClick={() => setShowFilters(false)}
              className="md:hidden w-full bg-[#3483FA] text-white py-3 rounded font-medium mt-4"
            >
              Aplicar filtros
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Product Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3483FA]"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou buscar por outro termo</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} horizontal />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
