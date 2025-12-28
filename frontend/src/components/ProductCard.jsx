import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, MessageCircle, FileText } from 'lucide-react';
import QuoteModal from './QuoteModal';
import { useDisplaySettings } from '../context/DisplaySettingsContext';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const ProductCard = ({ product, horizontal = false, onAddToCart }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { getDisplayValue } = useDisplaySettings();

  // Get display settings (product overrides take priority over global)
  const show = (key) => getDisplayValue(key, product.displayOverrides);

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = product.whatsappNumber?.replace(/\D/g, '') || '5511999999999';
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.title}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleQuoteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuoteModal(true);
  };

  const handleBuyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  const renderActionButton = () => {
    const actionType = product.actionType || 'buy';

    switch (actionType) {
      case 'whatsapp':
        return (
          <button 
            className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: '#25D366' }}
            onClick={handleWhatsAppClick}
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
        );
      case 'quote':
        return (
          <button 
            className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: colors.primary }}
            onClick={handleQuoteClick}
          >
            <FileText size={16} />
            Solicitar Cotação
          </button>
        );
      default:
        return (
          <button 
            className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: colors.accent }}
            onClick={handleBuyClick}
          >
            <ShoppingCart size={16} />
            Comprar
          </button>
        );
    }
  };

  const renderPrice = () => {
    const actionType = product.actionType || 'buy';

    if (!show('show_price')) {
      return null;
    }

    if (actionType === 'buy') {
      return (
        <>
          {show('show_original_price') && product.originalPrice && (
            <span className="text-xs text-gray-400 line-through block">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <div className="flex items-end gap-2 mb-3">
            <span className="text-xl font-bold" style={{ color: colors.primary }}>
              {formatPrice(product.price)}
            </span>
            {show('show_discount') && product.discount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                -{product.discount}%
              </span>
            )}
          </div>
          {show('show_installments') && product.installments && (
            <p className="text-xs text-gray-500 mb-3">
              em {product.installments}x {formatPrice(product.installmentPrice)}
            </p>
          )}
        </>
      );
    } else {
      return (
        <div className="mb-3">
          <span className="text-lg font-semibold" style={{ color: colors.primary }}>
            Sob consulta
          </span>
          <p className="text-xs text-gray-500">
            {actionType === 'whatsapp' ? 'Consulte via WhatsApp' : 'Solicite uma cotação'}
          </p>
        </div>
      );
    }
  };

  if (horizontal) {
    return (
      <>
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
            {product.actionType === 'buy' && product.freeShipping && (
              <span 
                className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full"
                style={{ backgroundColor: colors.accent }}
              >
                Frete Grátis
              </span>
            )}
            {product.actionType !== 'buy' && (
              <span 
                className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full"
                style={{ backgroundColor: product.actionType === 'whatsapp' ? '#25D366' : colors.primary }}
              >
                {product.actionType === 'whatsapp' ? 'WhatsApp' : 'Cotação'}
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
            
            {renderPrice()}
          </div>
        </Link>
        
        {showQuoteModal && (
          <QuoteModal 
            product={product} 
            onClose={() => setShowQuoteModal(false)} 
          />
        )}
      </>
    );
  }

  // Card Minimal - Design escolhido
  return (
    <>
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
          {product.actionType === 'buy' && product.freeShipping && (
            <span 
              className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: colors.accent }}
            >
              Frete Grátis
            </span>
          )}
          {product.actionType === 'buy' && product.discount && !product.freeShipping && (
            <span 
              className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full bg-green-500"
            >
              {product.discount}% OFF
            </span>
          )}
          {product.actionType !== 'buy' && (
            <span 
              className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: product.actionType === 'whatsapp' ? '#25D366' : colors.primary }}
            >
              {product.actionType === 'whatsapp' ? 'WhatsApp' : 'Cotação'}
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
          
          {renderPrice()}
          
          {renderActionButton()}
        </div>
      </Link>
      
      {showQuoteModal && (
        <QuoteModal 
          product={product} 
          onClose={() => setShowQuoteModal(false)} 
        />
      )}
    </>
  );
};

export default ProductCard;
