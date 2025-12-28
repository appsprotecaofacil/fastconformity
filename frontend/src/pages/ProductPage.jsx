import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../services/api';
import { useCart, useAuth } from '../App';
import { 
  ChevronLeft, ChevronRight, Heart, Share2, Truck, ShieldCheck, 
  Star, Minus, Plus, MapPin, RotateCcw, Award, MessageCircle, FileText
} from 'lucide-react';
import QuoteModal from '../components/QuoteModal';

const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productData, reviewsData] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getByProduct(id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Produto não encontrado</p>
        <Link to="/" className="text-[#3483FA] hover:underline">Voltar para a página inicial</Link>
      </div>
    );
  }

  const images = product.images || [product.image];

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleBuyNow = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      navigate('/cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      // Show success feedback
      alert('Produto adicionado ao carrinho!');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = product.whatsappNumber?.replace(/\D/g, '') || '5511999999999';
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.title}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleQuoteClick = () => {
    setShowQuoteModal(true);
  };

  const actionType = product?.actionType || 'buy';

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#3483FA]">Início</Link>
        <span className="mx-2">/</span>
        <Link to={`/search?category=${product.category}`} className="hover:text-[#3483FA] capitalize">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 line-clamp-1">{product.title}</span>
      </nav>

      <div className="bg-white rounded-lg p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Image Gallery */}
          <div className="lg:col-span-5">
            <div className="sticky top-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-4">
                <img 
                  src={images[selectedImage]} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden ${
                        index === selectedImage ? 'border-[#3483FA]' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-4">
            {/* Condition & Sold */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="capitalize">{product.condition}</span>
              <span>|</span>
              <span>{product.sold?.toLocaleString()} vendidos</span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-normal text-gray-800 mb-3">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < Math.floor(product.rating || 0) ? 'text-[#3483FA] fill-[#3483FA]' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-[#3483FA]">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviews} avaliações)</span>
            </div>

            {/* Price */}
            <div className="mb-4">
              {actionType === 'buy' ? (
                <>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through block">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl" style={{ color: colors.primary }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.discount && (
                      <span className="text-lg text-[#00A650] font-medium">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  {product.installments && (
                    <p className="text-lg text-[#00A650] mt-1">
                      em até <strong>{product.installments}x {formatPrice(product.installmentPrice)}</strong> sem juros
                    </p>
                  )}
                </>
              ) : (
                <div>
                  <span className="text-3xl font-semibold" style={{ color: colors.primary }}>
                    Sob consulta
                  </span>
                  <p className="text-gray-500 mt-1">
                    {actionType === 'whatsapp' 
                      ? 'Entre em contato pelo WhatsApp para negociar'
                      : 'Solicite uma cotação personalizada'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Descrição</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
            </div>

            {/* Specs */}
            {product.specs && product.specs.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Especificações</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-3 text-gray-500">{spec.label}</td>
                        <td className="py-2 px-3 text-gray-800">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-3">
            <div className="border rounded-lg p-4 sticky top-4">
              {/* Free Shipping */}
              {product.freeShipping && (
                <div className="flex items-start gap-2 text-[#00A650] mb-4">
                  <Truck size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Frete grátis</p>
                    <p className="text-xs text-gray-500">Saiba os prazos de entrega e as formas de envio</p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin size={16} />
                <span>Enviar para São Paulo, SP</span>
              </div>

              {/* Stock */}
              {actionType === 'buy' && (
                <div className="mb-4">
                  <p className="text-sm">
                    <span className="text-[#00A650]">Estoque disponível</span>
                  </p>
                  <p className="text-xs text-gray-500">{product.stock} unidades</p>
                </div>
              )}

              {/* Quantity - only for buy */}
              {actionType === 'buy' && (
                <div className="mb-4">
                  <label className="text-sm text-gray-600 block mb-2">Quantidade:</label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 border rounded hover:bg-gray-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-1 border rounded hover:bg-gray-50"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-sm text-gray-400">({product.stock} disponíveis)</span>
                  </div>
                </div>
              )}

              {/* Info for WhatsApp/Quote */}
              {actionType !== 'buy' && (
                <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: actionType === 'whatsapp' ? '#25D36615' : `${colors.primary}10` }}>
                  <p className="text-sm" style={{ color: actionType === 'whatsapp' ? '#128C7E' : colors.primary }}>
                    {actionType === 'whatsapp' 
                      ? '💬 Converse diretamente com nosso vendedor para negociar preços e condições especiais.'
                      : '📋 Preencha o formulário de cotação e entraremos em contato com uma proposta personalizada.'
                    }
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {actionType === 'buy' && (
                  <>
                    <button 
                      onClick={handleBuyNow}
                      disabled={addingToCart}
                      className="w-full text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 hover:opacity-90"
                      style={{ backgroundColor: colors.accent }}
                    >
                      {addingToCart ? 'Processando...' : 'Comprar agora'}
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                      style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}
                    >
                      Adicionar ao carrinho
                    </button>
                  </>
                )}
                
                {actionType === 'whatsapp' && (
                  <button 
                    onClick={handleWhatsAppClick}
                    className="w-full py-3 rounded-xl font-medium transition-colors hover:opacity-90 flex items-center justify-center gap-2 text-white"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <MessageCircle size={20} />
                    Falar no WhatsApp
                  </button>
                )}
                
                {actionType === 'quote' && (
                  <button 
                    onClick={handleQuoteClick}
                    className="w-full py-3 rounded-xl font-medium transition-colors hover:opacity-90 flex items-center justify-center gap-2 text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <FileText size={20} />
                    Solicitar Cotação
                  </button>
                )}
              </div>

              {/* Extra Actions */}
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t">
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex items-center gap-1 text-sm text-[#3483FA] hover:underline"
                >
                  <Heart size={16} className={isFavorite ? 'fill-[#3483FA]' : ''} />
                  Favoritar
                </button>
                <button className="flex items-center gap-1 text-sm text-[#3483FA] hover:underline">
                  <Share2 size={16} />
                  Compartilhar
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw size={16} className="text-[#00A650]" />
                  <span>Devolução grátis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck size={16} className="text-[#00A650]" />
                  <span>Compra garantida</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Vendido por</p>
                <p className="text-sm text-[#3483FA] font-medium">{product.seller?.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Award size={14} className="text-[#00A650]" />
                  <span className="text-xs text-[#00A650]">{product.seller?.reputation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Opiniões do produto</h2>
          
          {/* Rating Summary */}
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-light text-gray-800">{product.rating || 0}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < Math.floor(product.rating || 0) ? 'text-[#3483FA] fill-[#3483FA]' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">{product.reviews} avaliações</p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < review.rating ? 'text-[#3483FA] fill-[#3483FA]' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-1">Por {review.user}</p>
              </div>
            )) : (
              <p className="text-gray-500">Ainda não há avaliações para este produto.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
