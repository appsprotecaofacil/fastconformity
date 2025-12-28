import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    title: 'Ofertas do Dia',
    subtitle: 'Até 60% OFF em milhares de produtos',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    bgColor: '#FFE600'
  },
  {
    id: 2,
    title: 'Tecnologia',
    subtitle: 'Os melhores smartphones com até 12x sem juros',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=400&fit=crop',
    bgColor: '#3483FA'
  },
  {
    id: 3,
    title: 'Frete Grátis',
    subtitle: 'Em milhares de produtos para todo Brasil',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=400&fit=crop',
    bgColor: '#00A650'
  }
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
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
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id}
            className="w-full flex-shrink-0 relative h-[280px] md:h-[340px]"
            style={{ backgroundColor: banner.bgColor }}
          >
            <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center">
              <div className="flex-1 z-10">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-700">
                  {banner.subtitle}
                </p>
                <button className="mt-4 bg-[#3483FA] text-white px-6 py-2 rounded-sm hover:bg-[#2968c8] transition-colors">
                  Ver ofertas
                </button>
              </div>
              <div className="hidden md:block flex-1">
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-[280px] object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-[#3483FA]' : 'bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
