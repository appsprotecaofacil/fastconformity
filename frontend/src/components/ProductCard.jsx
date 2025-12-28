import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Star, Heart } from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const ProductCard = ({ product, horizontal = false }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (horizontal) {
    return (
      <Link 
        to={`/product/${product.id}`}
        className="flex bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
      >
        <div className="w-[180px] h-[180px] flex-shrink-0 bg-gray-50 p-4 relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          {product.freeShipping && (
            <span 
              className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: colors.accent }}
            >
              Frete Grátis
            </span>
          )}
        </div>
        <div className="flex-1 p-5">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-[#1E3A5F] transition-colors">
            {product.title}
          </h3>
          
          {product.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-400">({product.reviews})</span>
            </div>
          )}
          
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through block">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color: colors.primary }}>
              {formatPrice(product.price)}
            </span>
            {product.discount && (
              <span className="text-sm font-medium text-green-600">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {product.installments && (
            <p className="text-sm text-gray-500 mt-1">
              em até {product.installments}x {formatPrice(product.installmentPrice)} sem juros
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Card Minimal - Design escolhido
  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 block"
    >
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        {product.freeShipping && (
          <span 
            className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full"
            style={{ backgroundColor: colors.accent }}
          >
            Frete Grátis
          </span>
        )}
        {product.discount && !product.freeShipping && (
          <span 
            className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full bg-green-500"
          >
            {product.discount}% OFF
          </span>
        )}
        <button 
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          onClick={(e) => { e.preventDefault(); }}
        >
          <Heart size={18} className="text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-[#1E3A5F] transition-colors text-sm">
          {product.title}
        </h3>
        
        {product.rating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>
        )}
        
        {product.originalPrice && (
          <span className="text-xs text-gray-400 line-through block">
            {formatPrice(product.originalPrice)}
          </span>
        )}
        
        <div className="flex items-end gap-2 mb-3">
          <span className="text-xl font-bold" style={{ color: colors.primary }}>
            {formatPrice(product.price)}
          </span>
        </div>

        {product.installments && (
          <p className="text-xs text-gray-500 mb-3">
            em {product.installments}x {formatPrice(product.installmentPrice)}
          </p>
        )}
        
        <button 
          className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 hover:scale-[1.02] text-sm"
          style={{ backgroundColor: colors.accent }}
          onClick={(e) => { e.preventDefault(); }}
        >
          Comprar
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
