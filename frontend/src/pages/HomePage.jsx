import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/Banner';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../services/api';
import { Truck, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsAPI.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const dealProducts = products.filter(p => p.discount >= 20).slice(0, 6);
  const techProducts = products.filter(p => p.category === 'tecnologia').slice(0, 6);
  const recommendedProducts = products.slice(0, 12);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Banner Hero */}
      <Banner />

      {/* Benefits Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary}10` }}
              >
                <Truck style={{ color: colors.primary }} size={24} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Entrega Rápida</p>
                <p className="text-sm text-gray-500">Em até 24h</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${colors.accent}15` }}
              >
                <ShieldCheck style={{ color: colors.accent }} size={24} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Compra Segura</p>
                <p className="text-sm text-gray-500">100% protegida</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary}10` }}
              >
                <CreditCard style={{ color: colors.primary }} size={24} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Parcelamento</p>
                <p className="text-sm text-gray-500">Até 12x sem juros</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <CategoryGrid />

      {/* Deals Section */}
      {dealProducts.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
                Ofertas do dia
              </h2>
              <Link 
                to="/deals" 
                className="flex items-center gap-1 font-medium text-sm hover:underline transition-colors"
                style={{ color: colors.accent }}
              >
                Ver todas
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dealProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="max-w-[1200px] mx-auto px-4 py-4">
        <div 
          className="rounded-3xl p-8 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: colors.accent, transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: colors.accent, transform: 'translate(-30%, 30%)' }} />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3"
                style={{ backgroundColor: colors.accent }}
              >
                Exclusivo
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Primeira compra?</h3>
              <p className="text-white/80 text-lg">Use o cupom PRIMEIRA10 e ganhe 10% de desconto!</p>
            </div>
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: colors.accent }}
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      {techProducts.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
                Tecnologia
              </h2>
              <Link 
                to="/search?category=tecnologia" 
                className="flex items-center gap-1 font-medium text-sm hover:underline transition-colors"
                style={{ color: colors.accent }}
              >
                Ver mais
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {techProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Subscription Banner */}
      <section className="max-w-[1200px] mx-auto px-4 py-4">
        <div 
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{ backgroundColor: `${colors.accent}10` }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: colors.accent }}
                >
                  FC+
                </span>
                <span className="text-xl font-bold" style={{ color: colors.primary }}>
                  Assine e tenha benefícios exclusivos
                </span>
              </div>
              <p className="text-gray-600 text-lg">Frete grátis ilimitado, descontos especiais e muito mais</p>
            </div>
            <Link
              to="/subscription"
              className="px-8 py-4 rounded-2xl text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Assinar agora
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 py-8 pb-12">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
              Recomendados para você
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
