import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/adminApi';
import {
  TrendingUp, Package, Users, ShoppingCart, DollarSign,
  AlertTriangle, ArrowUp, ArrowDown
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_orders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_products || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
          </div>
          <div className="p-6">
            {stats?.recent_orders?.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Pedido #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Entregue' ? 'bg-green-100 text-green-700' :
                        order.status === 'Em trânsito' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum pedido recente</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Produtos Mais Vendidos</h2>
          </div>
          <div className="p-6">
            {stats?.top_products?.length > 0 ? (
              <div className="space-y-4">
                {stats.top_products.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.title}</p>
                      <p className="text-sm text-gray-500">{product.sold} vendidos</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatCurrency(product.price)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum produto vendido</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Estoque Baixo</h2>
          </div>
          <div className="p-6">
            {stats?.low_stock?.length > 0 ? (
              <div className="space-y-4">
                {stats.low_stock.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.title}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.stock} un.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Todos os produtos com estoque adequado</p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Produtos por Categoria</h2>
          </div>
          <div className="p-6">
            {stats?.categories?.length > 0 ? (
              <div className="space-y-3">
                {stats.categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                      {cat.count} produtos
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma categoria</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
