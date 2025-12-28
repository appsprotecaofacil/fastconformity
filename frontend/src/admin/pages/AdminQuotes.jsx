import React, { useState, useEffect } from 'react';
import { adminQuotesAPI } from '../../services/adminApi';
import { FileText, Search, Phone, Mail, Trash2, ChevronDown, CheckCircle, Clock, X, MessageSquare } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  contacted: { label: 'Contatado', color: 'bg-blue-100 text-blue-700', icon: Phone },
  converted: { label: 'Convertido', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed: { label: 'Fechado', color: 'bg-gray-100 text-gray-700', icon: X }
};

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [expandedQuote, setExpandedQuote] = useState(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [quotesData, statsData] = await Promise.all([
        adminQuotesAPI.getAll({ status: statusFilter || undefined, search: search || undefined }),
        adminQuotesAPI.getStats()
      ]);
      setQuotes(quotesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      await adminQuotesAPI.updateStatus(quoteId, newStatus);
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
      // Refresh stats
      const statsData = await adminQuotesAPI.getStats();
      setStats(statsData);
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminQuotesAPI.delete(id);
      setQuotes(quotes.filter(q => q.id !== id));
      setDeleteModal(null);
      // Refresh stats
      const statsData = await adminQuotesAPI.getStats();
      setStats(statsData);
    } catch (error) {
      alert('Erro ao excluir cotação');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotações</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie as solicitações de cotação</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total</span>
            <FileText size={20} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Pendentes</span>
            <Clock size={20} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Contatados</span>
            <Phone size={20} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.contacted || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Convertidos</span>
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.converted || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="contacted">Contatado</option>
            <option value="converted">Convertido</option>
            <option value="closed">Fechado</option>
          </select>
        </div>
      </div>

      {/* Quotes List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText size={48} className="mb-4" />
            <p>Nenhuma cotação encontrada</p>
          </div>
        ) : (
          <div className="divide-y">
            {quotes.map((quote) => {
              const StatusIcon = statusConfig[quote.status]?.icon || Clock;
              return (
                <div key={quote.id} className="hover:bg-gray-50">
                  {/* Main Row */}
                  <div 
                    className="flex items-center px-6 py-4 cursor-pointer"
                    onClick={() => setExpandedQuote(expandedQuote === quote.id ? null : quote.id)}
                  >
                    <button className="p-1 mr-3 text-gray-400">
                      <ChevronDown 
                        size={18} 
                        className={`transform transition-transform ${expandedQuote === quote.id ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    <img 
                      src={quote.product_image} 
                      alt={quote.product_title}
                      className="w-12 h-12 object-contain bg-gray-100 rounded-lg mr-4"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{quote.customer_name}</p>
                      <p className="text-sm text-gray-500 truncate">{quote.product_title}</p>
                    </div>
                    
                    <div className="hidden md:block px-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail size={14} />
                        {quote.customer_email}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone size={14} />
                        {quote.customer_phone}
                      </p>
                    </div>
                    
                    <div className="px-4">
                      <select
                        value={quote.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(quote.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[quote.status]?.color} border-0 cursor-pointer`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="contacted">Contatado</option>
                        <option value="converted">Convertido</option>
                        <option value="closed">Fechado</option>
                      </select>
                    </div>
                    
                    <div className="text-sm text-gray-500 px-4 hidden lg:block">
                      {formatDate(quote.created_at)}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal(quote);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedQuote === quote.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Cliente</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Nome:</strong> {quote.customer_name}</p>
                            <p><strong>Email:</strong> {quote.customer_email}</p>
                            <p><strong>Telefone:</strong> {quote.customer_phone}</p>
                            <p><strong>Data:</strong> {formatDate(quote.created_at)}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Mensagem</h4>
                          <div className="bg-white p-3 rounded-lg border text-sm text-gray-600">
                            {quote.message || <span className="text-gray-400 italic">Nenhuma mensagem</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a
                          href={`https://wa.me/${quote.customer_phone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          <MessageSquare size={16} />
                          WhatsApp
                        </a>
                        <a
                          href={`mailto:${quote.customer_email}?subject=Re: Cotação - ${quote.product_title}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          <Mail size={16} />
                          Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Cotação</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a cotação de <strong>{deleteModal.customer_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
