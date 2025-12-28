import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Heart, MessageCircle, FileText, ShoppingCart } from 'lucide-react';

const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const ProductCarousel = ({ title, subtitle, products, compact = false }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const formatPrice = (price) => {
    return price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = compact ? 200 : 280;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  const renderActionButton = (product) => {
    const actionType = product.actionType || 'buy';
    
    if (compact) {
      return null; // No button in compact mode
    }

    switch (actionType) {
      case 'whatsapp':
        return (
          <button 
            className="w-full py-2 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
            style={{ backgroundColor: '#25D366' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const phone = product.whatsappNumber?.replace(/\D/g, '') || '5511999999999';
              const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.title}`);
              window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            }}
          >
            <MessageCircle size={12} />
            WhatsApp
          </button>
        );
      case 'quote':
        return (
          <button 
            className="w-full py-2 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
            style={{ backgroundColor: colors.primary }}
            onClick={(e) => { e.preventDefault(); }}
          >
            <FileText size={12} />
            Cotação
          </button>
        );
      default:
        return (
          <button 
            className="w-full py-2 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
            style={{ backgroundColor: colors.accent }}
            onClick={(e) => { e.preventDefault(); }}
          >
            <ShoppingCart size={12} />
            Comprar
          </button>
        );
    }
  };

  const renderPrice = (product) => {
    const actionType = product.actionType || 'buy';
    
    if (actionType === 'buy') {
      return (
        <>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through block">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`} style={{ color: colors.primary }}>
            {formatPrice(product.price)}
          </span>
          {!compact && product.installments && (
            <p className="text-xs text-gray-500">
              em {product.installments}x {formatPrice(product.installmentPrice)}
            </p>
          )}
        </>
      );
    } else {
      return (
        <span className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: colors.primary }}>
          Sob consulta
        </span>
      );
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h3 className={`font-bold ${compact ? 'text-base' : 'text-xl'}`} style={{ color: colors.primary }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
        )}

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className={`flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group/card ${
                compact ? 'w-[160px]' : 'w-[220px]'
              }`}
            >
              {/* Image */}
              <div className={`relative bg-gray-50 overflow-hidden ${compact ? 'h-[120px]' : 'h-[180px]'}`}>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-300"
                />
                {/* Badges */}
                {product.actionType === 'buy' && product.freeShipping && (
                  <span 
                    className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium text-white rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  >
                    Frete Grátis
                  </span>
                )}
                {product.actionType !== 'buy' && (
                  <span 
                    className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium text-white rounded-full"
                    style={{ backgroundColor: product.actionType === 'whatsapp' ? '#25D366' : colors.primary }}
                  >
                    {product.actionType === 'whatsapp' ? 'WhatsApp' : 'Cotação'}
                  </span>
                )}
                {product.discount && product.actionType === 'buy' && !product.freeShipping && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium text-white rounded-full bg-green-500">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Content */}
              <div className={`${compact ? 'p-2' : 'p-3'}`}>
                <h4 className={`font-medium text-gray-900 line-clamp-2 mb-1 group-hover/card:text-[#1E3A5F] transition-colors ${
                  compact ? 'text-xs' : 'text-sm'
                }`}>
                  {product.title}
                </h4>

                {/* Rating */}
                {product.rating && !compact && (
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-2">
                  {renderPrice(product)}
                </div>

                {/* Action Button */}
                {renderActionButton(product)}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;
