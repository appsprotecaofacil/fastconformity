import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../App';
import { ordersAPI } from '../services/api';
import { Trash2, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCheckoutModal(true);
  };

  const confirmCheckout = async () => {
    setProcessing(true);
    try {
      await ordersAPI.create();
      await fetchCart();
      setShowCheckoutModal(false);
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erro ao criar pedido. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const calculatedTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const displayTotal = user ? cartTotal : calculatedTotal;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-6">Navegue pelo site e adicione produtos ao carrinho</p>
          <Link 
            to="/"
            className="inline-block bg-[#3483FA] text-white px-8 py-3 rounded font-medium hover:bg-[#2968c8] transition-colors"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#3483FA]">Início</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Carrinho</span>
      </nav>

      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Carrinho de compras</h1>

      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            <Link to="/login" className="text-[#3483FA] font-medium hover:underline">Entre na sua conta</Link>
            {' '}para salvar seu carrinho e finalizar a compra.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg p-4 flex gap-4">
              <Link to={`/product/${item.productId || item.id}`} className="flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-24 h-24 object-contain"
                />
              </Link>
              <div className="flex-1">
                <Link 
                  to={`/product/${item.productId || item.id}`}
                  className="text-gray-700 hover:text-[#3483FA] line-clamp-2"
                >
                  {item.title}
                </Link>
                
                {item.freeShipping && (
                  <div className="flex items-center gap-1 text-[#00A650] text-sm mt-1">
                    <Truck size={14} />
                    <span>Frete grátis</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 border rounded hover:bg-gray-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-xl font-medium text-gray-800">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} cada
                      </p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="flex items-center gap-1 text-sm text-[#3483FA] mt-3 hover:underline"
                >
                  <Trash2 size={14} />
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumo da compra</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Produtos ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span className="text-gray-800">{formatPrice(displayTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className="text-[#00A650]">Grátis</span>
              </div>
            </div>

            <div className="border-t my-4 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-semibold text-gray-800">{formatPrice(displayTotal)}</span>
              </div>
              <p className="text-sm text-[#00A650] mt-1">
                em até 12x {formatPrice(displayTotal / 12)} sem juros
              </p>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-[#3483FA] text-white py-3 rounded font-medium hover:bg-[#2968c8] transition-colors"
            >
              {user ? 'Continuar compra' : 'Entrar para comprar'}
            </button>

            <Link 
              to="/"
              className="block text-center text-[#3483FA] text-sm mt-3 hover:underline"
            >
              Continuar comprando
            </Link>

            {/* Guarantees */}
            <div className="mt-6 pt-4 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck size={18} className="text-[#00A650]" />
                <span>Compra Garantida: receba o produto que esperava ou devolvemos o dinheiro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirmar pedido</h3>
            
            <div className="mb-4">
              <p className="text-gray-600">Resumo do pedido:</p>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.title.slice(0, 30)}...</span>
                    <span className="text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatPrice(displayTotal)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCheckoutModal(false)}
                disabled={processing}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmCheckout}
                disabled={processing}
                className="flex-1 bg-[#3483FA] text-white py-2 rounded hover:bg-[#2968c8] disabled:opacity-50"
              >
                {processing ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
