import React, { useState, useEffect } from 'react';
import { adminCategoriesAPI } from '../../services/adminApi';
import { Plus, Edit, Trash2, FolderTree, X, Save, ChevronRight, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', icon: 'Package', parent_id: null });
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const iconOptions = [
    'Package', 'Smartphone', 'Refrigerator', 'Shirt', 'Home', 'Dumbbell', 
    'Car', 'ShoppingCart', 'Sparkles', 'Gamepad2', 'Wrench', 'BookOpen', 
    'Heart', 'Monitor', 'Headphones', 'Watch', 'Laptop', 'Camera',
    'Music', 'Tv', 'Bike', 'Baby', 'Palette', 'Utensils'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const [allData, parentData] = await Promise.all([
        adminCategoriesAPI.getAll(),
        adminCategoriesAPI.getParents()
      ]);
      setCategories(allData);
      setParentCategories(parentData);
      
      // Expand all parent categories by default
      const expanded = {};
      parentData.forEach(cat => { expanded[cat.id] = true; });
      setExpandedCategories(expanded);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null, isChild = false, parentId = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        slug: category.slug, 
        icon: category.icon || 'Package',
        parent_id: category.parent_id
      });
    } else {
      setEditingCategory(null);
      setFormData({ 
        name: '', 
        slug: '', 
        icon: 'Package',
        parent_id: isChild ? parentId : null
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    setSaving(true);

    try {
      const dataToSend = {
        name: formData.name,
        slug: formData.slug,
        icon: formData.icon,
        parent_id: formData.parent_id || null
      };
      
      if (editingCategory) {
        await adminCategoriesAPI.update(editingCategory.id, dataToSend);
      } else {
        await adminCategoriesAPI.create(dataToSend);
      }
      await fetchCategories();
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminCategoriesAPI.delete(id);
      await fetchCategories();
      setDeleteModal(null);
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao excluir categoria');
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const getIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={20} /> : <Icons.Package size={20} />;
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Organize categories into hierarchy
  const organizedCategories = () => {
    const parents = categories.filter(c => !c.parent_id);
    const children = categories.filter(c => c.parent_id);
    
    return parents.map(parent => ({
      ...parent,
      children: children.filter(c => c.parent_id === parent.id)
    }));
  };

  const hierarchicalCategories = organizedCategories();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie categorias e subcategorias</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FolderTree size={48} className="mb-4" />
            <p>Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          <div className="divide-y">
            {hierarchicalCategories.map((category) => (
              <div key={category.id}>
                {/* Parent Category Row */}
                <div className="flex items-center px-6 py-4 hover:bg-gray-50">
                  <button
                    onClick={() => toggleExpand(category.id)}
                    className="p-1 mr-2 text-gray-400 hover:text-gray-600 rounded"
                  >
                    {category.children && category.children.length > 0 ? (
                      expandedCategories[category.id] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )
                    ) : (
                      <span className="w-[18px] inline-block"></span>
                    )}
                  </button>
                  
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                    {getIcon(category.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {category.product_count} produtos
                    </span>
                    {category.children && category.children.length > 0 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        {category.children.length} subcategorias
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openModal(null, true, category.id)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Adicionar subcategoria"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteModal(category)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      disabled={category.product_count > 0 || (category.children && category.children.length > 0)}
                      title={category.product_count > 0 ? 'Categoria possui produtos' : category.children?.length > 0 ? 'Exclua subcategorias primeiro' : 'Excluir'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Child Categories */}
                {expandedCategories[category.id] && category.children && category.children.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    {category.children.map((child) => (
                      <div key={child.id} className="flex items-center px-6 py-3 pl-16 hover:bg-gray-100 border-b border-gray-100 last:border-b-0">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                        
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mr-3">
                          {getIcon(child.icon)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">{child.name}</div>
                          <div className="text-xs text-gray-500">{child.slug}</div>
                        </div>
                        
                        <span className="bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-xs">
                          {child.product_count} produtos
                        </span>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => openModal(child)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(child)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            disabled={child.product_count > 0}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Editar Categoria' : formData.parent_id ? 'Nova Subcategoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Parent Category Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">📁 Categoria Principal</option>
                  <optgroup label="📂 Subcategoria de:">
                    {parentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        └─ {cat.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.parent_id 
                    ? 'Esta será uma subcategoria (categoria filha)' 
                    : 'Esta será uma categoria principal (pode ter subcategorias)'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingCategory ? formData.slug : generateSlug(e.target.value)
                    });
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="slug-da-categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        formData.icon === icon
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                      title={icon}
                    >
                      {getIcon(icon)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.slug}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Categoria</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir <strong>{deleteModal.name}</strong>?
              {deleteModal.parent_id ? ' (subcategoria)' : ''}
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

export default AdminCategories;
