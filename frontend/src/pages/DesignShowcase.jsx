import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, User, MapPin, ChevronDown, Star, Truck, Shield, CreditCard, ArrowRight, Menu } from 'lucide-react';

// Paleta de cores escolhida
const colors = {
  primary: '#1E3A5F',      // Azul escuro
  accent: '#FF6B35',       // Laranja vibrante
  light: '#F8FAFC',
  dark: '#0F172A',
  gray: '#64748B',
};

// Produtos de exemplo
const sampleProducts = [
  { id: 1, title: 'iPhone 15 Pro Max 256GB', price: 8999.00, oldPrice: 9999.00, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300', rating: 4.8, reviews: 1250, freeShipping: true },
  { id: 2, title: 'MacBook Air M3 15"', price: 12499.00, oldPrice: 14999.00, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300', rating: 4.9, reviews: 890, freeShipping: true },
  { id: 3, title: 'Sony WH-1000XM5', price: 2299.00, oldPrice: 2799.00, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300', rating: 4.7, reviews: 2100, freeShipping: true },
  { id: 4, title: 'Samsung Galaxy Watch 6', price: 1899.00, oldPrice: 2199.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', rating: 4.6, reviews: 567, freeShipping: false },
];

// ==================== HEADERS ====================

// Header A - Minimalista
const HeaderMinimalista = () => (
  <header className="bg-white shadow-sm border-b sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between gap-8">
        <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
          Fast<span style={{ color: colors.accent }}>Conformity</span>
        </h1>
        
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos, marcas e muito mais..."
              className="w-full px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              style={{ '--tw-ring-color': colors.accent }}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white" style={{ backgroundColor: colors.accent }}>
              <Search size={18} />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
            <MapPin size={18} />
            <span>São Paulo</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <Heart size={22} />
          </button>
          <button className="text-gray-600 hover:text-gray-900 relative">
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: colors.accent }}>3</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: colors.primary }}>
            <User size={18} />
            Entrar
          </button>
        </nav>
      </div>
    </div>
  </header>
);

// Header B - Gradiente Moderno
const HeaderGradiente = () => (
  <header className="sticky top-0 z-50" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}>
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between gap-8">
        <h1 className="text-2xl font-bold text-white">
          Fast<span style={{ color: colors.accent }}>Conformity</span>
        </h1>
        
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="O que você está procurando?"
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:bg-white/20 text-white placeholder-white/70 text-sm"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white" style={{ backgroundColor: colors.accent }}>
              <Search size={18} />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-5">
          <button className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
            <MapPin size={18} />
            <span>São Paulo</span>
          </button>
          <button className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Heart size={22} />
          </button>
          <button className="text-white/80 hover:text-white relative p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ShoppingCart size={22} />
            <span className="absolute top-0 right-0 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: colors.accent }}>3</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium border-2 border-white/30 hover:bg-white/10 transition-colors">
            <User size={18} />
            Entrar
          </button>
        </nav>
      </div>
    </div>
  </header>
);

// Header C - Flutuante (estilo Apple)
const HeaderFlutuante = ({ scrolled }) => (
  <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between gap-8">
        <h1 className={`text-2xl font-bold transition-colors ${scrolled ? '' : 'text-white'}`} style={{ color: scrolled ? colors.primary : undefined }}>
          Fast<span style={{ color: colors.accent }}>Conformity</span>
        </h1>
        
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className={`w-full px-5 py-2.5 rounded-full focus:outline-none text-sm transition-all ${scrolled ? 'bg-gray-100 border border-gray-200' : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70'}`}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white" style={{ backgroundColor: colors.accent }}>
              <Search size={18} />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-5">
          <button className={`p-2 rounded-full transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'}`}>
            <Heart size={22} />
          </button>
          <button className={`p-2 rounded-full transition-colors relative ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'}`}>
            <ShoppingCart size={22} />
            <span className="absolute top-0 right-0 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: colors.accent }}>3</span>
          </button>
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${scrolled ? 'text-white' : 'text-white border border-white/30 hover:bg-white/10'}`} style={{ backgroundColor: scrolled ? colors.primary : 'transparent' }}>
            <User size={18} />
            Entrar
          </button>
        </nav>
      </div>
    </div>
  </header>
);

// ==================== CARDS DE PRODUTOS ====================

// Card A - Minimal
const CardMinimal = ({ product }) => (
  <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="relative overflow-hidden aspect-square bg-gray-50">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      {product.freeShipping && (
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full" style={{ backgroundColor: colors.accent }}>
          Frete Grátis
        </span>
      )}
      <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart size={18} className="text-gray-400 hover:text-red-500" />
      </button>
    </div>
    <div className="p-5">
      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-900 transition-colors">{product.title}</h3>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
        </div>
        <span className="text-sm text-gray-400">({product.reviews})</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold" style={{ color: colors.primary }}>
          R$ {product.price.toLocaleString('pt-BR')}
        </span>
        {product.oldPrice && (
          <span className="text-sm text-gray-400 line-through">R$ {product.oldPrice.toLocaleString('pt-BR')}</span>
        )}
      </div>
      <button className="w-full mt-4 py-3 rounded-2xl text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: colors.accent }}>
        Comprar
      </button>
    </div>
  </div>
);

// Card B - Glassmorphism
const CardGlass = ({ product }) => (
  <div className="group relative rounded-3xl overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl" />
    <div className="relative p-4">
      <div className="relative overflow-hidden aspect-square rounded-2xl bg-white/30 mb-4">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.freeShipping && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full backdrop-blur-sm" style={{ backgroundColor: `${colors.accent}CC` }}>
            Frete Grátis
          </span>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/50 backdrop-blur-sm rounded-full">
          <Heart size={18} className="text-gray-600 hover:text-red-500" />
        </button>
      </div>
      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-400/20 rounded-full">
          <Star size={12} className="fill-yellow-500 text-yellow-500" />
          <span className="text-xs font-medium text-yellow-700">{product.rating}</span>
        </div>
        <span className="text-xs text-gray-500">({product.reviews} avaliações)</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold" style={{ color: colors.primary }}>
            R$ {product.price.toLocaleString('pt-BR')}
          </span>
          {product.oldPrice && (
            <p className="text-sm text-gray-400 line-through">R$ {product.oldPrice.toLocaleString('pt-BR')}</p>
          )}
        </div>
        <button className="p-3 rounded-2xl text-white transition-all hover:scale-105" style={{ backgroundColor: colors.accent }}>
          <ShoppingCart size={20} />
        </button>
      </div>
    </div>
  </div>
);

// Card C - Neumorphism
const CardNeumorphism = ({ product }) => (
  <div className="group bg-[#E8EAEE] rounded-3xl p-4" style={{ boxShadow: '8px 8px 16px #c5c7ca, -8px -8px 16px #ffffff' }}>
    <div className="relative overflow-hidden aspect-square rounded-2xl mb-4" style={{ boxShadow: 'inset 4px 4px 8px #c5c7ca, inset -4px -4px 8px #ffffff' }}>
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 p-2 rounded-2xl"
      />
      {product.freeShipping && (
        <span className="absolute top-4 left-4 px-3 py-1 text-xs font-medium text-white rounded-full" style={{ backgroundColor: colors.accent }}>
          Frete Grátis
        </span>
      )}
    </div>
    <h3 className="font-medium text-gray-800 line-clamp-2 mb-2">{product.title}</h3>
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ boxShadow: 'inset 2px 2px 4px #c5c7ca, inset -2px -2px 4px #ffffff' }}>
        <Star size={14} className="fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
      </div>
      <span className="text-sm text-gray-500">({product.reviews})</span>
    </div>
    <div className="flex items-end gap-2 mb-4">
      <span className="text-2xl font-bold" style={{ color: colors.primary }}>
        R$ {product.price.toLocaleString('pt-BR')}
      </span>
    </div>
    <button 
      className="w-full py-3 rounded-2xl text-white font-medium transition-all active:scale-95"
      style={{ 
        backgroundColor: colors.accent,
        boxShadow: '4px 4px 8px #c5c7ca, -4px -4px 8px #ffffff'
      }}
    >
      Adicionar ao Carrinho
    </button>
  </div>
);

// ==================== LAYOUTS DE HOMEPAGE ====================

// Layout A - Hero Grande
const LayoutHeroGrande = () => (
  <div>
    {/* Hero Section */}
    <section className="relative h-[70vh] flex items-center" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: colors.accent }} />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: colors.accent }} />
      </div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white mb-6" style={{ backgroundColor: colors.accent }}>
            Novidades de Dezembro
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Encontre tudo o que você precisa
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Milhares de produtos com os melhores preços e entrega rápida para todo o Brasil.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:scale-105" style={{ backgroundColor: colors.accent }}>
              Ver Ofertas
              <ArrowRight className="inline ml-2" size={20} />
            </button>
            <button className="px-8 py-4 rounded-2xl text-white font-semibold text-lg border-2 border-white/30 hover:bg-white/10 transition-all">
              Categorias
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8" style={{ color: colors.primary }}>Categorias em Destaque</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Tecnologia', 'Moda', 'Casa', 'Esportes', 'Beleza', 'Veículos'].map((cat, i) => (
            <div key={i} className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all cursor-pointer text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                <span className="text-2xl">📦</span>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

// Layout B - Grid Moderno
const LayoutGridModerno = () => (
  <div className="bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4">
      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4 mb-8">
        {/* Main Banner */}
        <div className="col-span-12 md:col-span-8 rounded-3xl p-8 flex items-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4" style={{ backgroundColor: colors.accent }}>
              Ofertas Especiais
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Até 50% OFF</h2>
            <p className="text-white/70 mb-6">Em milhares de produtos selecionados</p>
            <button className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: colors.accent }}>
              Ver Ofertas
            </button>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: colors.accent }} />
        </div>

        {/* Side Cards */}
        <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4">
          <div className="rounded-3xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: colors.accent }}>
            <h3 className="text-xl font-bold mb-2">Frete Grátis</h3>
            <p className="text-white/80 text-sm">Acima de R$ 99</p>
            <Truck className="absolute right-4 bottom-4 opacity-20" size={64} />
          </div>
          <div className="rounded-3xl p-6 bg-white border border-gray-100">
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>Cupom de 10%</h3>
            <p className="text-gray-500 text-sm">Use: PRIMEIRA10</p>
          </div>
        </div>
      </div>

      {/* Products with hover effects */}
      <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>Mais Vendidos</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {sampleProducts.map((product, i) => (
          <div key={i} className="group relative">
            <div className="absolute inset-0 rounded-3xl transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ backgroundColor: colors.accent, transform: 'rotate(-2deg)' }} />
            <div className="relative bg-white rounded-3xl p-4 border border-gray-100 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>R$ {product.price.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Layout C - Storytelling
const LayoutStorytelling = () => (
  <div>
    {/* Intro Section */}
    <section className="py-20 bg-white text-center">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colors.primary }}>
          Bem-vindo à <span style={{ color: colors.accent }}>FastConformity</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sua nova forma de comprar online. Rápido, seguro e com os melhores preços.
        </p>
        <div className="flex justify-center gap-6 text-center">
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
              <Truck size={28} style={{ color: colors.primary }} />
            </div>
            <p className="font-medium text-gray-900">Entrega Rápida</p>
            <p className="text-sm text-gray-500">Em até 24h</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent}10` }}>
              <Shield size={28} style={{ color: colors.accent }} />
            </div>
            <p className="font-medium text-gray-900">Compra Segura</p>
            <p className="text-sm text-gray-500">100% protegida</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
              <CreditCard size={28} style={{ color: colors.primary }} />
            </div>
            <p className="font-medium text-gray-900">Parcelamento</p>
            <p className="text-sm text-gray-500">Até 12x sem juros</p>
          </div>
        </div>
      </div>
    </section>

    {/* Featured Section */}
    <section className="py-16" style={{ backgroundColor: colors.light }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white mb-6" style={{ backgroundColor: colors.accent }}>
              Destaques
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: colors.primary }}>
              Os melhores produtos, selecionados para você
            </h2>
            <p className="text-gray-600 mb-8">
              Nossa equipe seleciona diariamente as melhores ofertas e produtos de qualidade garantida.
            </p>
            <button className="px-8 py-4 rounded-2xl text-white font-semibold transition-all hover:opacity-90" style={{ backgroundColor: colors.accent }}>
              Explorar Agora
              <ArrowRight className="inline ml-2" size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {sampleProducts.slice(0, 2).map((product, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{product.title}</h3>
                <p className="font-bold" style={{ color: colors.accent }}>R$ {product.price.toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 text-center text-white" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar?</h2>
        <p className="text-xl text-white/80 mb-8">Crie sua conta e aproveite descontos exclusivos</p>
        <button className="px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:scale-105" style={{ backgroundColor: colors.accent }}>
          Criar Conta Grátis
        </button>
      </div>
    </section>
  </div>
);

// ==================== COMPONENTE PRINCIPAL ====================

const DesignShowcase = () => {
  const [activeSection, setActiveSection] = useState('headers');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <div className="sticky top-0 z-[100] bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold" style={{ color: colors.primary }}>
              🎨 Design Showcase - FastConformity
            </h1>
            <div className="flex gap-2">
              {[
                { id: 'headers', label: '📱 Headers' },
                { id: 'cards', label: '🃏 Cards' },
                { id: 'layouts', label: '📐 Layouts' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{ backgroundColor: activeSection === item.id ? colors.accent : undefined }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Headers Section */}
      {activeSection === 'headers' && (
        <div className="space-y-12 pb-12">
          <section className="pt-8">
            <div className="max-w-7xl mx-auto px-4 mb-4">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>A) Header Minimalista</h2>
              <p className="text-gray-500">Limpo, moderno e fácil de usar</p>
            </div>
            <HeaderMinimalista />
            <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-400">
              Conteúdo da página...
            </div>
          </section>

          <section>
            <div className="max-w-7xl mx-auto px-4 mb-4">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>B) Header Gradiente Moderno</h2>
              <p className="text-gray-500">Elegante com efeito de profundidade</p>
            </div>
            <HeaderGradiente />
            <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-400">
              Conteúdo da página...
            </div>
          </section>

          <section>
            <div className="max-w-7xl mx-auto px-4 mb-4">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>C) Header Flutuante</h2>
              <p className="text-gray-500">Transparente que fica sólido ao rolar (demonstração estática)</p>
            </div>
            <div className="relative">
              <div className="relative" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}>
                <HeaderFlutuante scrolled={false} />
                <div className="h-32 flex items-center justify-center text-white/50">
                  Header transparente sobre banner
                </div>
              </div>
              <div className="mt-4">
                <HeaderFlutuante scrolled={true} />
                <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                  Header sólido após rolagem
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Cards Section */}
      {activeSection === 'cards' && (
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {/* Card Minimal */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>A) Cards Minimal</h2>
              <p className="text-gray-500 mb-6">Bordas arredondadas, sombra suave, hover com zoom</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sampleProducts.map((product) => (
                  <CardMinimal key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* Card Glass */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>B) Cards Glassmorphism</h2>
              <p className="text-gray-500 mb-6">Efeito de vidro fosco, bordas translúcidas</p>
              <div className="p-8 rounded-3xl" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)` }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sampleProducts.map((product) => (
                    <CardGlass key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>

            {/* Card Neumorphism */}
            <section>
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>C) Cards Neumorphism</h2>
              <p className="text-gray-500 mb-6">Efeito 3D suave com profundidade</p>
              <div className="p-8 rounded-3xl bg-[#E8EAEE]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sampleProducts.map((product) => (
                    <CardNeumorphism key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Layouts Section */}
      {activeSection === 'layouts' && (
        <div className="space-y-16 pb-12">
          {/* Layout A */}
          <section className="pt-8">
            <div className="max-w-7xl mx-auto px-4 mb-4">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>A) Layout Hero Grande</h2>
              <p className="text-gray-500">Banner hero em tela cheia com call-to-action forte</p>
            </div>
            <div className="border-4 border-dashed border-gray-300 rounded-3xl overflow-hidden">
              <LayoutHeroGrande />
            </div>
          </section>

          {/* Layout B */}
          <section>
            <div className="max-w-7xl mx-auto px-4 mb-4">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>B) Layout Grid Moderno</h2>
              <p className="text-gray-500">Grid assimétrico com hover effects elegantes</p>
            </div>
            <div className="border-4 border-dashed border-gray-300 rounded-3xl overflow-hidden">
              <LayoutGridModerno />
            </div>
          </section>

          {/* Layout C */}
          <section>
            <div className="max-w-7xl mx-auto px-4 mb-4">
              <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>C) Layout Storytelling</h2>
              <p className="text-gray-500">Seções que contam uma história, com transições suaves</p>
            </div>
            <div className="border-4 border-dashed border-gray-300 rounded-3xl overflow-hidden">
              <LayoutStorytelling />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DesignShowcase;
