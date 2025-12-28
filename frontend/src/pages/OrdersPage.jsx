import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Package, ChevronRight, Truck, CheckCircle, Clock } from 'lucide-react';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load orders from localStorage (mock)
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Entregue':
        return <CheckCircle size={18} className="text-[#00A650]" />;
      case 'Em trânsito':
        return <Truck size={18} className="text-[#3483FA]" />;
      default:
        return <Clock size={18} className="text-yellow-500" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'Processando';
    if (activeTab === 'shipped') return order.status === 'Em trânsito';
    if (activeTab === 'delivered') return order.status === 'Entregue';
    return true;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#3483FA]">Início</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Minhas compras</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#3483FA] rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <Link 
                to="/orders"
                className="flex items-center gap-2 px-3 py-2 bg-[#E8F4FD] text-[#3483FA] rounded"
              >
                <Package size={18} />
                <span>Minhas compras</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg">
            {/* Tabs */}
            <div className="flex border-b overflow-x-auto">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'pending', label: 'Pendentes' },
                { id: 'shipped', label: 'Em trânsito' },
                { id: 'delivered', label: 'Entregues' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-[#3483FA] text-[#3483FA]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="p-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Você ainda não tem compras</p>
                  <Link 
                    to="/"
                    className="inline-block mt-4 text-[#3483FA] hover:underline"
                  >
                    Comece a comprar
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="font-medium text-gray-800">{order.status}</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(order.date)}</span>
                      </div>

                      {/* Order Items */}
                      {order.items.map(item => (
                        <div key={item.id} className="flex gap-4 py-3 border-t">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-16 h-16 object-contain"
                          />
                          <div className="flex-1">
                            <Link 
                              to={`/product/${item.id}`}
                              className="text-gray-700 hover:text-[#3483FA] line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Order Footer */}
                      <div className="flex items-center justify-between pt-3 border-t mt-3">
                        <span className="font-semibold text-gray-800">
                          Total: {formatPrice(order.total)}
                        </span>
                        <button className="flex items-center gap-1 text-[#3483FA] text-sm hover:underline">
                          Ver detalhes <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
