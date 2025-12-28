import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminBlogPostsAPI, adminBlogCategoriesAPI, adminProductsAPI } from '../../services/adminApi';
import { ArrowLeft, Save, Eye, Image, X, Search } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminBlogPostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category_id: '',
    author_name: 'Administrador',
    status: 'draft',
    allow_comments: true,
    product_ids: []
  });

  // Quill editor modules
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ]
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent', 'align',
    'link', 'image', 'video', 'blockquote', 'code-block'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          adminBlogCategoriesAPI.getAll(),
          adminProductsAPI.getAll()
        ]);
        setCategories(categoriesData);
        setProducts(productsData);

        if (isEditing) {
          const postData = await adminBlogPostsAPI.getById(id);
          setFormData({
            title: postData.title || '',
            slug: postData.slug || '',
            excerpt: postData.excerpt || '',
            content: postData.content || '',
            cover_image: postData.coverImage || '',
            category_id: postData.categoryId || '',
            author_name: postData.author || 'Administrador',
            status: postData.status || 'draft',
            allow_comments: postData.allowComments ?? true,
            product_ids: postData.productIds || []
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title)
    }));
  };

  const addProduct = (productId) => {
    if (!formData.product_ids.includes(productId)) {
      setFormData(prev => ({
        ...prev,
        product_ids: [...prev.product_ids, productId]
      }));
    }
    setShowProductSearch(false);
    setProductSearch('');
  };

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.filter(id => id !== productId)
    }));
  };

  const handleSubmit = async (publishNow = false) => {
    if (!formData.title || !formData.slug) {
      alert('Preencha o título e slug do post');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        status: publishNow ? 'published' : formData.status
      };

      if (isEditing) {
        await adminBlogPostsAPI.update(id, data);
      } else {
        await adminBlogPostsAPI.create(data);
      }

      navigate('/admin/blog');
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao salvar post');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProducts = products.filter(p => formData.product_ids.includes(p.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Post' : 'Novo Post'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Eye size={18} />
            {saving ? 'Salvando...' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Título do post"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/blog/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="url-do-post"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  placeholder="URL da imagem de capa"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {formData.cover_image && (
                <img 
                  src={formData.cover_image} 
                  alt="Preview" 
                  className="w-24 h-16 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Resumo</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Breve descrição do post (aparece na listagem)"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
            <div className="border rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder="Escreva o conteúdo do post..."
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Publicação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                <input
                  type="text"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Categoria</h3>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Comentários</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="allow_comments"
                checked={formData.allow_comments}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Permitir comentários neste post</span>
            </label>
          </div>

          {/* Related Products */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Produtos Relacionados</h3>
            
            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="space-y-2 mb-4">
                {selectedProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-10 h-10 object-contain bg-white rounded"
                    />
                    <span className="flex-1 text-sm truncate">{product.title}</span>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Product Button */}
            <button
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="w-full px-4 py-2 border-2 border-dashed rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + Adicionar produto
            </button>

            {/* Product Search */}
            {showProductSearch && (
              <div className="mt-4">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Buscar produto..."
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {filteredProducts.slice(0, 10).map(product => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product.id)}
                      disabled={formData.product_ids.includes(product.id)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left disabled:opacity-50 border-b last:border-b-0"
                    >
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-8 h-8 object-contain bg-gray-50 rounded"
                      />
                      <span className="text-sm truncate">{product.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom styles for Quill */}
      <style>{`
        .ql-container {
          min-height: 350px;
          font-size: 16px;
        }
        .ql-editor {
          min-height: 350px;
        }
      `}</style>
    </div>
  );
};

export default AdminBlogPostForm;
