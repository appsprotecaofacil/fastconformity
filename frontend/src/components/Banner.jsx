import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const banners = [
  {
    id: 1,
    tag: 'Novidades de Dezembro',
    title: 'Encontre tudo o que você precisa',
    subtitle: 'Milhares de produtos com os melhores preços e entrega rápida para todo o Brasil.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    tag: 'Ofertas Especiais',
    title: 'Até 50% OFF em Tecnologia',
    subtitle: 'Os melhores smartphones, notebooks e acessórios com preços imperdíveis.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    tag: 'Frete Grátis',
    title: 'Compre sem sair de casa',
    subtitle: 'Frete grátis em milhares de produtos para todo o Brasil.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
  }
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Section - Layout A (Hero Grande) */}
      <div 
        className="relative min-h-[500px] md:min-h-[550px] flex items-center"
        style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10"
            style={{ backgroundColor: colors.accent }}
          />
          <div 
            className="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-10"
            style={{ backgroundColor: colors.accent }}
          />
          <div 
            className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-5"
            style={{ backgroundColor: colors.accent }}
          />
        </div>

        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-700 ease-out w-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div 
              key={banner.id}
              className="w-full flex-shrink-0"
            >
              <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center py-12">
                <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                  {/* Content */}
                  <div className="flex-1 z-10 text-center md:text-left">
                    <span 
                      className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white mb-6"
                      style={{ backgroundColor: colors.accent }}
                    >
                      {banner.tag}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
                      {banner.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <Link
                        to="/deals"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:scale-105 hover:opacity-90"
                        style={{ backgroundColor: colors.accent }}
                      >
                        Ver Ofertas
                        <ArrowRight className="ml-2" size={20} />
                      </Link>
                      <Link
                        to="/search"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-semibold text-lg border-2 border-white/30 hover:bg-white/10 transition-all"
                      >
                        Categorias
                      </Link>
                    </div>
                  </div>
                  
                  {/* Image */}
                  <div className="flex-1 hidden md:block">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 rounded-3xl transform rotate-3 opacity-20"
                        style={{ backgroundColor: colors.accent }}
                      />
                      <img 
                        src={banner.image} 
                        alt={banner.title}
                        className="relative w-full h-[350px] object-cover rounded-3xl shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
        >
          <ChevronRight size={24} className="text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-8' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              style={{ backgroundColor: index === currentSlide ? colors.accent : undefined }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
