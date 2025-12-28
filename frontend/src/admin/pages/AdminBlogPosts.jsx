import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminBlogPostsAPI } from '../../services/adminApi';
import { Plus, Edit, Trash2, Eye, FileText, Search, Calendar, MessageSquare } from 'lucide-react';

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  published: { label: 'Publicado', color: 'bg-green-100 text-green-700' }
};

const AdminBlogPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [postsData, statsData] = await Promise.all([
        adminBlogPostsAPI.getAll({ status: statusFilter || undefined }),
        adminBlogPostsAPI.getStats()
      ]);
      setPosts(postsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter locally for now
    if (search) {
      setPosts(posts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminBlogPostsAPI.delete(id);
      setPosts(posts.filter(p => p.id !== id));
      setDeleteModal(null);
      fetchData();
    } catch (error) {
      alert('Erro ao excluir post');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os posts do blog</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/blog/categories"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Categorias
          </Link>
          <Link
            to="/admin/blog/comments"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
          >
            Comentários
            {stats.pendingComments > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.pendingComments}
              </span>
            )}
          </Link>
          <Link
            to="/admin/blog/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Novo Post
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total de Posts</span>
            <FileText size={20} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPosts || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Publicados</span>
            <Eye size={20} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.publishedPosts || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Rascunhos</span>
            <FileText size={20} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.draftPosts || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Visualizações</span>
            <Eye size={20} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalViews || 0}</p>
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
                placeholder="Buscar posts..."
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
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText size={48} className="mb-4" />
            <p>Nenhum post encontrado</p>
            <Link
              to="/admin/blog/new"
              className="mt-4 text-blue-600 hover:underline"
            >
              Criar primeiro post
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center px-6 py-4 hover:bg-gray-50">
                {/* Cover Image */}
                <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FileText size={24} />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(post.publishedAt)}
                    </span>
                    {post.category && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{post.category}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {post.views || 0}
                    </span>
                    {post.allowComments && (
                      <MessageSquare size={14} className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Status */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[post.status]?.color}`}>
                  {statusConfig[post.status]?.label}
                </span>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    to={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </Link>
                  <button
                    onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteModal(post)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Post</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir <strong>{deleteModal.title}</strong>?
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

export default AdminBlogPosts;
