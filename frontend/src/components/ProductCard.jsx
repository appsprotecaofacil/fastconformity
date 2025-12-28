import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Star } from 'lucide-react';

const ProductCard = ({ product, horizontal = false }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (horizontal) {
    return (
      <Link 
        to={`/product/${product.id}`}
        className="flex bg-white rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-100"
      >
        <div className="w-[180px] h-[180px] flex-shrink-0 bg-white p-2">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 p-4">
          <h3 className="text-sm text-gray-700 hover:text-[#3483FA] line-clamp-2 mb-2">
            {product.title}
          </h3>
          
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-gray-800">
              {formatPrice(product.price)}
            </span>
            {product.discount && (
              <span className="text-sm text-[#00A650] font-medium">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {product.installments && (
            <p className="text-sm text-[#00A650] mt-1">
              em até {product.installments}x {formatPrice(product.installmentPrice)} sem juros
            </p>
          )}

          {product.freeShipping && (
            <div className="flex items-center gap-1 text-[#00A650] text-sm mt-2">
              <Truck size={14} />
              <span className="font-medium">Frete grátis</span>
            </div>
          )}

          {product.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star size={14} className="text-[#3483FA] fill-[#3483FA]" />
              <span className="text-sm text-gray-600">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviews})</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/product/${product.id}`}
      className="block bg-white rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
    >
      <div className="relative aspect-square bg-white p-4">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
        />
        {product.discount && (
          <span className="absolute top-2 left-2 bg-[#00A650] text-white text-xs px-2 py-1 rounded-sm">
            {product.discount}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        {product.originalPrice && (
          <span className="text-xs text-gray-400 line-through block">
            {formatPrice(product.originalPrice)}
          </span>
        )}
        
        <div className="flex items-baseline gap-2">
          <span className="text-xl text-gray-800">
            {formatPrice(product.price)}
          </span>
        </div>

        {product.installments && (
          <p className="text-xs text-[#00A650] mt-1">
            em {product.installments}x {formatPrice(product.installmentPrice)}
          </p>
        )}

        {product.freeShipping && (
          <div className="flex items-center gap-1 text-[#00A650] text-xs mt-2">
            <Truck size={12} />
            <span className="font-medium">Frete grátis</span>
          </div>
        )}

        <h3 className="text-sm text-gray-600 mt-2 line-clamp-2 group-hover:text-[#3483FA]">
          {product.title}
        </h3>
      </div>
    </Link>
  );
};

export default ProductCard;
