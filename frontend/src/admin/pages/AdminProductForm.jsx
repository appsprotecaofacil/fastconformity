import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProductsAPI, adminCategoriesAPI, adminDisplaySettingsAPI } from '../../services/adminApi';
import { ArrowLeft, Plus, X, Save, Eye, EyeOff, Settings } from 'lucide-react';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    discount: 0,
    installments: 12,
    image: '',
    images: [],
    free_shipping: true,
    category_id: '',
    condition: 'novo',
    brand: '',
    stock: 0,
    seller_name: 'Loja Oficial',
    seller_reputation: 'MercadoLíder',
    seller_location: 'São Paulo',
    specs: [],
    action_type: 'buy',
    whatsapp_number: '',
    display_overrides: null
  });
  const [newSpec, setNewSpec] = useState({ label: '', value: '' });
  const [newImage, setNewImage] = useState('');
  const [globalDisplaySettings, setGlobalDisplaySettings] = useState({});
  const [useGlobalDisplay, setUseGlobalDisplay] = useState(true);
  const [displayOverrides, setDisplayOverrides] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, displaySettingsData] = await Promise.all([
          adminCategoriesAPI.getAll(),
          adminDisplaySettingsAPI.getAll()
        ]);
        setCategories(categoriesData);
        setGlobalDisplaySettings(displaySettingsData.settings);
        setDisplayOverrides(displaySettingsData.settings);

        if (isEdit) {
          const productData = await adminProductsAPI.getById(id);
          setFormData({
            title: productData.title || '',
            description: productData.description || '',
            price: productData.price || '',
            original_price: productData.original_price || '',
            discount: productData.discount || 0,
            installments: productData.installments || 12,
            image: productData.image || '',
            images: productData.images || [],
            free_shipping: productData.free_shipping ?? true,
            category_id: productData.category_id || '',
            condition: productData.condition || 'novo',
            brand: productData.brand || '',
            stock: productData.stock || 0,
            seller_name: productData.seller_name || 'Loja Oficial',
            seller_reputation: productData.seller_reputation || 'MercadoLíder',
            seller_location: productData.seller_location || 'São Paulo',
            specs: productData.specs || [],
            action_type: productData.action_type || 'buy',
            whatsapp_number: productData.whatsapp_number || '',
            display_overrides: productData.display_overrides || null
          });
          
          // Set display overrides state
          if (productData.display_overrides) {
            setUseGlobalDisplay(false);
            setDisplayOverrides(productData.display_overrides);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSpec = () => {
    if (newSpec.label && newSpec.value) {
      setFormData(prev => ({
        ...prev,
        specs: [...prev.specs, { ...newSpec }]
      }));
      setNewSpec({ label: '', value: '' });
    }
  };

  const removeSpec = (index) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImage && !formData.images.includes(newImage)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount: parseInt(formData.discount) || 0,
        installments: parseInt(formData.installments) || 12,
        stock: parseInt(formData.stock) || 0,
        category_id: parseInt(formData.category_id),
        whatsapp_number: formData.whatsapp_number || null,
        display_overrides: useGlobalDisplay ? null : displayOverrides
      };

      if (isEdit) {
        await adminProductsAPI.update(id, data);
      } else {
        await adminProductsAPI.create(data);
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condição</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="novo">Novo</option>
                      <option value="usado">Usado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preços e Estoque</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Original</label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto %</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="free_shipping"
                    checked={formData.free_shipping}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Frete grátis</span>
                </label>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Especificações</h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Atributo"
                  value={newSpec.label}
                  onChange={(e) => setNewSpec({ ...newSpec, label: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Valor"
                  value={newSpec.value}
                  onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addSpec}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />
                </button>
              </div>

              {formData.specs.length > 0 && (
                <div className="space-y-2">
                  {formData.specs.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                      <span><strong>{spec.label}:</strong> {spec.value}</span>
                      <button
                        type="button"
                        onClick={() => removeSpec(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagens</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Principal *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  placeholder="URL da imagem"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 w-full h-32 object-contain rounded-lg bg-gray-50" />
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagens Adicionais</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="URL da imagem"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <img src={img} alt="" className="w-12 h-12 object-cover rounded" />
                        <span className="flex-1 text-xs truncate">{img}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Type */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Ação</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ação do Produto</label>
                  <select
                    name="action_type"
                    value={formData.action_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="buy">🛒 Comprar (adicionar ao carrinho)</option>
                    <option value="whatsapp">💬 WhatsApp (redirecionar)</option>
                    <option value="quote">📋 Cotação (formulário)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.action_type === 'buy' && 'Cliente pode adicionar ao carrinho e comprar normalmente'}
                    {formData.action_type === 'whatsapp' && 'Cliente será redirecionado para WhatsApp ao clicar'}
                    {formData.action_type === 'quote' && 'Cliente preenche um formulário para solicitar cotação'}
                  </p>
                </div>
                
                {formData.action_type === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número do WhatsApp *</label>
                    <input
                      type="text"
                      name="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                      placeholder="Ex: 5511999999999"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: código do país + DDD + número (sem espaços ou símbolos)
                    </p>
                  </div>
                )}

                {formData.action_type !== 'buy' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>Atenção:</strong> Produtos com WhatsApp ou Cotação mostrarão "Sob consulta" no lugar do preço.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendedor</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    name="seller_name"
                    value={formData.seller_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reputação</label>
                  <select
                    name="seller_reputation"
                    value={formData.seller_reputation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MercadoLíder Platinum">MercadoLíder Platinum</option>
                    <option value="MercadoLíder Gold">MercadoLíder Gold</option>
                    <option value="MercadoLíder">MercadoLíder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                  <input
                    type="text"
                    name="seller_location"
                    value={formData.seller_location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
