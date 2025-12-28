import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { useAuth } from '../App';
import { Calendar, User, Eye, ArrowLeft, MessageSquare, Send, Tag, ShoppingBag, Clock } from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const BlogPostDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [commentForm, setCommentForm] = useState({
    author: user?.name || '',
    email: user?.email || '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchRecentPosts();
  }, [slug]);

  useEffect(() => {
    if (user) {
      setCommentForm(prev => ({
        ...prev,
        author: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        blogAPI.getPost(slug),
        blogAPI.getComments(slug)
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const data = await blogAPI.getRecentPosts(4);
      setRecentPosts(data);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.email || !commentForm.content) return;

    setSubmittingComment(true);
    try {
      await blogAPI.createComment(slug, commentForm);
      setCommentForm({ ...commentForm, content: '' });
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 5000);
    } catch (error) {
      alert('Erro ao enviar comentário. Tente novamente.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Tag size={64} className="mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Artigo não encontrado</h1>
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          <ArrowLeft size={18} />
          Voltar ao Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div 
        className="relative py-8"
        style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar ao Blog
          </Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 -mt-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Cover Image */}
            {post.coverImage && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-xl">
                <img 
                  src={post.coverImage} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
              {/* Category */}
              {post.category && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4"
                  style={{ backgroundColor: colors.accent }}
                >
                  {post.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 mb-8 pb-8 border-b">
                <span className="flex items-center gap-2">
                  <User size={18} />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={18} />
                  {formatDate(post.publishedAt)}
                </span>
                {post.views > 0 && (
                  <span className="flex items-center gap-2">
                    <Eye size={18} />
                    {post.views} visualizações
                  </span>
                )}
              </div>

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-a:text-[#FF6B35] prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-blockquote:border-l-[#FF6B35] prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
                  prose-pre:bg-gray-900
                "
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Related Products */}
              {post.relatedProducts && post.relatedProducts.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
                    <ShoppingBag size={22} style={{ color: colors.accent }} />
                    Produtos Relacionados
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {post.relatedProducts.map(product => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-16 h-16 object-contain bg-white rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate group-hover:text-[#1E3A5F] transition-colors">
                            {product.title}
                          </h4>
                          <p className="text-lg font-bold" style={{ color: colors.accent }}>
                            R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            {post.allowComments && (
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mt-8">
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
                  <MessageSquare size={22} style={{ color: colors.primary }} />
                  Comentários ({comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Seu nome *"
                      value={commentForm.author}
                      onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                      className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Seu email *"
                      value={commentForm.email}
                      onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                      className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Escreva seu comentário..."
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] resize-none mb-4"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">* Comentários são moderados antes da publicação</p>
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Send size={18} />
                      {submittingComment ? 'Enviando...' : 'Enviar Comentário'}
                    </button>
                  </div>
                  {commentSuccess && (
                    <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl text-sm">
                      ✓ Comentário enviado com sucesso! Será publicado após aprovação.
                    </div>
                  )}
                </form>

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Seja o primeiro a comentar!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        >
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={12} />
                              {formatCommentDate(comment.date)}
                            </span>
                          </div>
                          <p className="text-gray-600">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Recent Posts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Posts Recentes</h3>
              <div className="space-y-4">
                {recentPosts.filter(p => p.slug !== slug).slice(0, 3).map((recentPost) => (
                  <Link
                    key={recentPost.id}
                    to={`/blog/${recentPost.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {recentPost.coverImage ? (
                        <img 
                          src={recentPost.coverImage} 
                          alt={recentPost.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-[#1E3A5F] transition-colors">
                        {recentPost.title}
                      </h4>
                      <span className="text-xs text-gray-400">{formatDate(recentPost.publishedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                to="/blog"
                className="block text-center mt-4 text-sm font-medium hover:underline"
                style={{ color: colors.accent }}
              >
                Ver todos os posts
              </Link>
            </div>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/blog?category=${cat.slug}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetailPage;
