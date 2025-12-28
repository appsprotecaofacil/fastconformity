import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminBlogCommentsAPI } from '../../services/adminApi';
import { MessageSquare, Check, X, Trash2, ArrowLeft, Clock, ExternalLink } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700', icon: Check },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700', icon: X }
};

const AdminBlogComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await adminBlogCommentsAPI.getAll({ status: statusFilter || undefined });
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      await adminBlogCommentsAPI.updateStatus(commentId, newStatus);
      fetchComments();
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminBlogCommentsAPI.delete(id);
      setComments(comments.filter(c => c.id !== id));
      setDeleteModal(null);
    } catch (error) {
      alert('Erro ao excluir comentário');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/blog"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comentários</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie os comentários do blog</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', ''].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === '' ? 'Todos' : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare size={48} className="mb-4" />
            <p>Nenhum comentário {statusFilter ? statusConfig[statusFilter]?.label.toLowerCase() : ''}</p>
          </div>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => {
              const StatusIcon = statusConfig[comment.status]?.icon || Clock;
              return (
                <div key={comment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium flex-shrink-0">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        {comment.email && (
                          <span className="text-sm text-gray-500">{comment.email}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[comment.status]?.color}`}>
                          {statusConfig[comment.status]?.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDate(comment.createdAt)}</span>
                        <Link 
                          to={`/blog/${comment.postSlug}`}
                          target="_blank"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {comment.postTitle}
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Aprovar"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(comment.id, 'rejected')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Rejeitar"
                        >
                          <X size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal(comment)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Comentário</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o comentário de <strong>{deleteModal.author}</strong>?
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

export default AdminBlogComments;
