import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { Calendar, User, Eye, ArrowRight, Search, Tag } from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsData, categoriesData] = await Promise.all([
        blogAPI.getPosts({ 
          category: selectedCategory || undefined, 
          page,
          limit: 9
        }),
        blogAPI.getCategories()
      ]);
      setPosts(postsData.posts || postsData);
      setTotalPages(postsData.pages || 1);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter locally or implement server-side search
    if (searchQuery) {
      const filtered = posts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPosts(filtered);
    } else {
      fetchData();
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

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative py-16 md:py-24"
        style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #2D4A6F 100%)` }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Blog Fast<span style={{ color: colors.accent }}>Conformity</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              Dicas, novidades e conteúdos exclusivos sobre nossos produtos e serviços
            </p>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar artigos..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => { setSelectedCategory(''); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory 
                  ? 'text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
              style={!selectedCategory ? { backgroundColor: colors.primary } : {}}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.slug 
                    ? 'text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
                style={selectedCategory === cat.slug ? { backgroundColor: colors.primary } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum artigo encontrado</h3>
            <p className="text-gray-500">Tente buscar por outro termo ou categoria</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link 
                to={`/blog/${featuredPost.slug}`}
                className="group block mb-12 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-[16/10] md:aspect-auto">
                    {featuredPost.coverImage ? (
                      <img 
                        src={featuredPost.coverImage} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: `${colors.primary}10` }}
                      >
                        <Tag size={64} style={{ color: colors.primary }} className="opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    {featuredPost.category && (
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4 w-fit"
                        style={{ backgroundColor: colors.accent }}
                      >
                        {typeof featuredPost.category === 'object' ? featuredPost.category.name : featuredPost.category}
                      </span>
                    )}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-[#1E3A5F] transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-gray-600 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <User size={16} />
                        {featuredPost.author}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                      {featuredPost.views > 0 && (
                        <span className="flex items-center gap-2">
                          <Eye size={16} />
                          {featuredPost.views}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Posts Grid */}
            {otherPosts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      {post.coverImage ? (
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: `${colors.primary}10` }}
                        >
                          <Tag size={40} style={{ color: colors.primary }} className="opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {post.category && (
                        <span 
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3"
                          style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}
                        >
                          {post.category}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1E3A5F] transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1 font-medium group-hover:gap-2 transition-all" style={{ color: colors.accent }}>
                          Ler mais <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      page === pageNum 
                        ? 'text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                    }`}
                    style={page === pageNum ? { backgroundColor: colors.primary } : {}}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
