import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import { homeAPI, categoriesAPI } from '../services/api';
import { Truck, CreditCard, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

// Dynamic Hero Banner Component
const HeroBanner = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <div 
        className="h-[400px] flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}
      >
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo à FastConformity</h1>
          <p className="text-xl opacity-80">As melhores ofertas você encontra aqui</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${slide.imageUrl})` }}
      >
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${(slide.overlayOpacity || 40) / 100})` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1200px] mx-auto px-4 flex items-center">
        <div className="max-w-xl">
          {slide.title && (
            <h1 
              className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in"
              style={{ color: slide.textColor || '#FFFFFF' }}
            >
              {slide.title}
            </h1>
          )}
          {slide.subtitle && (
            <p 
              className="text-lg md:text-xl mb-6 opacity-90"
              style={{ color: slide.textColor || '#FFFFFF' }}
            >
              {slide.subtitle}
            </p>
          )}
          {slide.linkUrl && slide.linkText && (
            <Link
              to={slide.linkUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: colors.accent }}
            >
              {slide.linkText}
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white z-20 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white z-20 transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
};

// Benefits Bar Component
const BenefitsBar = ({ config }) => {
  const defaultItems = [
    { icon: 'Truck', title: 'Entrega Rápida', subtitle: 'Em até 24h' },
    { icon: 'ShieldCheck', title: 'Compra Segura', subtitle: '100% protegida' },
    { icon: 'CreditCard', title: 'Parcelamento', subtitle: 'Até 12x sem juros' },
  ];

  const items = config?.items || defaultItems;
  const iconColors = [colors.primary, colors.accent, colors.primary];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center md:justify-between gap-6">
          {items.map((item, idx) => {
            const IconComponent = LucideIcons[item.icon] || Truck;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${iconColors[idx % iconColors.length]}15` }}
                >
                  <IconComponent style={{ color: iconColors[idx % iconColors.length] }} size={24} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Product Carousel Component
const ProductCarousel = ({ carousel }) => {
  if (!carousel.products || carousel.products.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
              {carousel.title}
            </h2>
            {carousel.subtitle && (
              <p className="text-gray-500 mt-1">{carousel.subtitle}</p>
            )}
          </div>
          <Link 
            to="/search" 
            className="flex items-center gap-1 font-medium text-sm hover:underline transition-colors"
            style={{ color: colors.accent }}
          >
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {carousel.products.slice(0, 12).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Promo Banners Component
const PromoBanners = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.slice(0, 2).map(banner => (
          <Link
            key={banner.id}
            to={banner.linkUrl || '/search'}
            className="relative rounded-3xl overflow-hidden group h-[200px]"
          >
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {banner.badgeText && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-2"
                  style={{ backgroundColor: colors.accent }}
                >
                  {banner.badgeText}
                </span>
              )}
              {banner.title && (
                <h3 className="text-xl font-bold text-white">{banner.title}</h3>
              )}
              {banner.description && (
                <p className="text-white/80 text-sm mt-1">{banner.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Newsletter Component
const Newsletter = ({ settings }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  if (settings?.newsletter_enabled === 'false') return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8">
      <div 
        className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: colors.accent, transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: colors.accent, transform: 'translate(-30%, 30%)' }} />
        
        <div className="relative z-10">
          <Mail className="w-12 h-12 mx-auto mb-4 text-white/80" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {settings?.newsletter_title || 'Fique por dentro das novidades'}
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            {settings?.newsletter_subtitle || 'Cadastre-se e receba ofertas exclusivas'}
          </p>
          
          {subscribed ? (
            <div className="bg-green-500/20 text-white px-6 py-3 rounded-xl inline-block">
              ✓ Obrigado! Você receberá nossas novidades.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: colors.accent }}
              >
                Inscrever-se
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

// Main HomePage Component
const HomePage = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await homeAPI.getData();
        setHomeData(data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
      </div>
    );
  }

  const sections = homeData?.sections || [];
  const heroSlides = homeData?.heroSlides || [];
  const carousels = homeData?.carousels || [];
  const promoBanners = homeData?.promoBanners || [];
  const settings = homeData?.settings || {};

  // Render sections based on order
  const renderSection = (section) => {
    switch (section.type) {
      case 'hero':
        return <HeroBanner key={section.id} slides={heroSlides} />;
      
      case 'benefits':
        if (settings.benefits_enabled === 'false') return null;
        return <BenefitsBar key={section.id} config={section.config} />;
      
      case 'categories':
        return (
          <div key={section.id}>
            {(section.title || section.subtitle) && (
              <div className="max-w-[1200px] mx-auto px-4 pt-8">
                {section.title && (
                  <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>{section.title}</h2>
                )}
                {section.subtitle && (
                  <p className="text-gray-500 mt-1">{section.subtitle}</p>
                )}
              </div>
            )}
            <CategoryGrid />
          </div>
        );
      
      case 'carousel':
        const carouselId = section.config?.carouselId;
        const carousel = carousels.find(c => c.id === carouselId) || carousels[0];
        if (!carousel) return null;
        return <ProductCarousel key={section.id} carousel={{
          ...carousel,
          title: section.title || carousel.title,
          subtitle: section.subtitle || carousel.subtitle
        }} />;
      
      case 'promo_banners':
        return <PromoBanners key={section.id} banners={promoBanners} />;
      
      case 'newsletter':
        return <Newsletter key={section.id} settings={settings} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50">
      {sections.map(section => renderSection(section))}
      
      {/* Render remaining carousels not linked to sections */}
      {carousels.slice(1).map(carousel => (
        <ProductCarousel key={`carousel-${carousel.id}`} carousel={carousel} />
      ))}
    </div>
  );
};

export default HomePage;
