import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, GripVertical, Eye, EyeOff, Edit2, Trash2, Plus, Save, 
  Image, Type, ShoppingBag, Layout, Mail, ChevronDown, ChevronUp,
  Sliders, Award, RefreshCw
} from 'lucide-react';
import { adminHomeAPI } from '../../services/adminApi';

const sectionIcons = {
  hero: Image,
  benefits: Award,
  categories: Layout,
  carousel: ShoppingBag,
  promo_banners: Image,
  newsletter: Mail,
  content: Type,
};

const sectionLabels = {
  hero: 'Banner Principal',
  benefits: 'Benefícios',
  categories: 'Categorias',
  carousel: 'Carrossel de Produtos',
  promo_banners: 'Banners Promocionais',
  newsletter: 'Newsletter',
  content: 'Conteúdo',
};

const AdminHome = () => {
  const [sections, setSections] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [carousels, setCarousels] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('layout');
  const [expandedSection, setExpandedSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [sectionsData, slidesData, carouselsData, bannersData, settingsData] = await Promise.all([
        adminHomeAPI.getSections(),
        adminHomeAPI.getHeroSlides(),
        adminHomeAPI.getCarousels(),
        adminHomeAPI.getBanners(),
        adminHomeAPI.getSettings()
      ]);
      setSections(sectionsData);
      setHeroSlides(slidesData);
      setCarousels(carouselsData);
      setBanners(bannersData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newSections = [...sections];
    const draggedSection = newSections[draggedItem];
    newSections.splice(draggedItem, 1);
    newSections.splice(index, 0, draggedSection);
    
    setSections(newSections);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    setDraggedItem(null);
    const order = sections.map(s => s.id);
    try {
      await adminHomeAPI.reorderSections(order);
    } catch (error) {
      console.error('Error reordering sections:', error);
    }
  };

  const toggleSectionActive = async (section) => {
    try {
      await adminHomeAPI.updateSection(section.id, { is_active: !section.isActive });
      setSections(sections.map(s => 
        s.id === section.id ? { ...s, isActive: !s.isActive } : s
      ));
    } catch (error) {
      console.error('Error toggling section:', error);
    }
  };

  const handleSaveSlide = async (slide) => {
    setSaving(true);
    try {
      if (slide.id) {
        await adminHomeAPI.updateHeroSlide(slide.id, slide);
      } else {
        await adminHomeAPI.createHeroSlide(slide);
      }
      fetchData();
      setEditingItem(null);
    } catch (error) {
      alert('Erro ao salvar slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Remover este slide?')) return;
    try {
      await adminHomeAPI.deleteHeroSlide(id);
      setHeroSlides(heroSlides.filter(s => s.id !== id));
    } catch (error) {
      alert('Erro ao remover slide');
    }
  };

  const handleSaveCarousel = async (carousel) => {
    setSaving(true);
    try {
      if (carousel.id) {
        await adminHomeAPI.updateCarousel(carousel.id, carousel);
      } else {
        await adminHomeAPI.createCarousel(carousel);
      }
      fetchData();
      setEditingItem(null);
    } catch (error) {
      alert('Erro ao salvar carrossel');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCarousel = async (id) => {
    if (!window.confirm('Remover este carrossel?')) return;
    try {
      await adminHomeAPI.deleteCarousel(id);
      setCarousels(carousels.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao remover carrossel');
    }
  };

  const handleSaveBanner = async (banner) => {
    setSaving(true);
    try {
      if (banner.id) {
        await adminHomeAPI.updateBanner(banner.id, banner);
      } else {
        await adminHomeAPI.createBanner(banner);
      }
      fetchData();
      setEditingItem(null);
    } catch (error) {
      alert('Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Remover este banner?')) return;
    try {
      await adminHomeAPI.deleteBanner(id);
      setBanners(banners.filter(b => b.id !== id));
    } catch (error) {
      alert('Erro ao remover banner');
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Home className="text-purple-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Home</h1>
            <p className="text-gray-500 text-sm">Editor visual com drag & drop</p>
          </div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye size={18} />
          Preview
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'layout', label: 'Layout', icon: Layout },
          { id: 'hero', label: 'Banner Hero', icon: Image },
          { id: 'carousels', label: 'Carrosséis', icon: ShoppingBag },
          { id: 'banners', label: 'Banners', icon: Image },
          { id: 'settings', label: 'Configurações', icon: Sliders },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors ${
              activeTab === tab.id 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Layout Tab - Drag & Drop Sections */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> Arraste as seções para reordenar. Clique no olho para ativar/desativar.
            </p>
          </div>
          
          {sections.map((section, index) => {
            const Icon = sectionIcons[section.type] || Layout;
            return (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  draggedItem === index ? 'opacity-50 scale-[0.98]' : ''
                } ${!section.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical size={20} />
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {section.title || sectionLabels[section.type]}
                    </h3>
                    <p className="text-xs text-gray-500">{sectionLabels[section.type]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedSection === section.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                      onClick={() => toggleSectionActive(section)}
                      className={`p-2 rounded-lg transition-colors ${
                        section.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {section.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                
                {expandedSection === section.id && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => {
                            setSections(sections.map(s => 
                              s.id === section.id ? { ...s, title: e.target.value } : s
                            ));
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Título da seção"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                        <input
                          type="text"
                          value={section.subtitle || ''}
                          onChange={(e) => {
                            setSections(sections.map(s => 
                              s.id === section.id ? { ...s, subtitle: e.target.value } : s
                            ));
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Subtítulo opcional"
                        />
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await adminHomeAPI.updateSection(section.id, {
                            title: section.title,
                            subtitle: section.subtitle
                          });
                          alert('Seção atualizada!');
                        } catch (error) {
                          alert('Erro ao salvar');
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hero Slides Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Slides do Banner Principal</h2>
            <button
              onClick={() => setEditingItem({ type: 'slide', data: { title: '', subtitle: '', image_url: '', link_url: '', link_text: 'Ver mais', is_active: true } })}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={18} />
              Novo Slide
            </button>
          </div>

          <div className="grid gap-4">
            {heroSlides.map(slide => (
              <div key={slide.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="flex">
                  <div className="w-48 h-32 bg-gray-100 flex-shrink-0">
                    <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-medium text-gray-900">{slide.title || 'Sem título'}</h3>
                    <p className="text-sm text-gray-500 mb-2">{slide.subtitle}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Link: {slide.linkUrl || 'Nenhum'}</span>
                      <span>•</span>
                      <span className={slide.isActive ? 'text-green-600' : 'text-red-600'}>
                        {slide.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <button
                      onClick={() => setEditingItem({ type: 'slide', data: {
                        id: slide.id, title: slide.title, subtitle: slide.subtitle,
                        image_url: slide.imageUrl, link_url: slide.linkUrl, link_text: slide.linkText,
                        text_color: slide.textColor, overlay_opacity: slide.overlayOpacity,
                        sort_order: slide.sortOrder, is_active: slide.isActive
                      }})}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carousels Tab */}
      {activeTab === 'carousels' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Carrosséis de Produtos</h2>
            <button
              onClick={() => setEditingItem({ type: 'carousel', data: { title: '', subtitle: '', selection_type: 'rule', selection_rule: { orderBy: 'rating', order: 'desc' }, max_products: 12, is_active: true } })}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={18} />
              Novo Carrossel
            </button>
          </div>

          <div className="grid gap-4">
            {carousels.map(carousel => (
              <div key={carousel.id} className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{carousel.title}</h3>
                    <p className="text-sm text-gray-500">{carousel.subtitle}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>Tipo: {carousel.selectionType === 'manual' ? 'Manual' : 'Automático'}</span>
                      <span>•</span>
                      <span>Máx: {carousel.maxProducts} produtos</span>
                      <span>•</span>
                      <span className={carousel.isActive ? 'text-green-600' : 'text-red-600'}>
                        {carousel.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem({ type: 'carousel', data: {
                        id: carousel.id, title: carousel.title, subtitle: carousel.subtitle,
                        selection_type: carousel.selectionType, selection_rule: carousel.selectionRule,
                        product_ids: carousel.productIds, max_products: carousel.maxProducts, is_active: carousel.isActive
                      }})}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCarousel(carousel.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Banners Promocionais</h2>
            <button
              onClick={() => setEditingItem({ type: 'banner', data: { title: '', description: '', image_url: '', link_url: '', badge_text: '', layout_type: 'full', is_active: true } })}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={18} />
              Novo Banner
            </button>
          </div>

          <div className="grid gap-4">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="flex">
                  <div className="w-48 h-28 bg-gray-100 flex-shrink-0">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-medium text-gray-900">{banner.title || 'Sem título'}</h3>
                    <p className="text-sm text-gray-500 mb-2">{banner.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Layout: {banner.layoutType}</span>
                      {banner.badgeText && <><span>•</span><span>Badge: {banner.badgeText}</span></>}
                      <span>•</span>
                      <span className={banner.isActive ? 'text-green-600' : 'text-red-600'}>
                        {banner.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <button
                      onClick={() => setEditingItem({ type: 'banner', data: {
                        id: banner.id, title: banner.title, description: banner.description,
                        image_url: banner.imageUrl, link_url: banner.linkUrl, badge_text: banner.badgeText,
                        layout_type: banner.layoutType, background_color: banner.backgroundColor,
                        start_date: banner.startDate, end_date: banner.endDate, is_active: banner.isActive
                      }})}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Newsletter</h3>
                <p className="text-sm text-gray-500">Exibir seção de newsletter na home</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newsletter_enabled === 'true'}
                  onChange={async (e) => {
                    const newSettings = { ...settings, newsletter_enabled: e.target.checked ? 'true' : 'false' };
                    setSettings(newSettings);
                    await adminHomeAPI.updateSettings(newSettings);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Benefícios</h3>
                <p className="text-sm text-gray-500">Exibir barra de benefícios</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.benefits_enabled === 'true'}
                  onChange={async (e) => {
                    const newSettings = { ...settings, benefits_enabled: e.target.checked ? 'true' : 'false' };
                    setSettings(newSettings);
                    await adminHomeAPI.updateSettings(newSettings);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Texto da Newsletter</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Título</label>
                  <input
                    type="text"
                    value={settings.newsletter_title || ''}
                    onChange={(e) => setSettings({ ...settings, newsletter_title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Subtítulo</label>
                  <input
                    type="text"
                    value={settings.newsletter_subtitle || ''}
                    onChange={(e) => setSettings({ ...settings, newsletter_subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={async () => {
                    try {
                      await adminHomeAPI.updateSettings(settings);
                      alert('Configurações salvas!');
                    } catch (error) {
                      alert('Erro ao salvar');
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 w-fit"
                >
                  <Save size={16} />
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem.data.id ? 'Editar' : 'Novo'} {
                  editingItem.type === 'slide' ? 'Slide' :
                  editingItem.type === 'carousel' ? 'Carrossel' : 'Banner'
                }
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Slide Form */}
              {editingItem.type === 'slide' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem *</label>
                    <input
                      type="text"
                      value={editingItem.data.image_url}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, image_url: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={editingItem.data.subtitle}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, subtitle: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do Link</label>
                      <input
                        type="text"
                        value={editingItem.data.link_url}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, link_url: e.target.value } })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="/search"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                      <input
                        type="text"
                        value={editingItem.data.link_text}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, link_text: e.target.value } })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Ver mais"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="slide_active"
                      checked={editingItem.data.is_active}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, is_active: e.target.checked } })}
                      className="rounded"
                    />
                    <label htmlFor="slide_active" className="text-sm text-gray-700">Ativo</label>
                  </div>
                </>
              )}

              {/* Carousel Form */}
              {editingItem.type === 'carousel' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={editingItem.data.subtitle}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, subtitle: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Seleção</label>
                    <select
                      value={editingItem.data.selection_type}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, selection_type: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="rule">Automático (por regra)</option>
                      <option value="manual">Manual (IDs específicos)</option>
                    </select>
                  </div>
                  {editingItem.data.selection_type === 'rule' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                        <select
                          value={editingItem.data.selection_rule?.orderBy || 'rating'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, selection_rule: { ...editingItem.data.selection_rule, orderBy: e.target.value } } })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="rating">Avaliação</option>
                          <option value="sold">Mais Vendidos</option>
                          <option value="price">Preço</option>
                          <option value="discount">Desconto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desconto mínimo (%)</label>
                        <input
                          type="number"
                          value={editingItem.data.selection_rule?.minDiscount || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, selection_rule: { ...editingItem.data.selection_rule, minDiscount: parseInt(e.target.value) || null } } })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Produtos</label>
                    <input
                      type="number"
                      value={editingItem.data.max_products}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, max_products: parseInt(e.target.value) } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="carousel_active"
                      checked={editingItem.data.is_active}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, is_active: e.target.checked } })}
                      className="rounded"
                    />
                    <label htmlFor="carousel_active" className="text-sm text-gray-700">Ativo</label>
                  </div>
                </>
              )}

              {/* Banner Form */}
              {editingItem.type === 'banner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem *</label>
                    <input
                      type="text"
                      value={editingItem.data.image_url}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, image_url: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={editingItem.data.description}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do Link</label>
                      <input
                        type="text"
                        value={editingItem.data.link_url}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, link_url: e.target.value } })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                      <input
                        type="text"
                        value={editingItem.data.badge_text}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, badge_text: e.target.value } })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="NOVO, PROMOÇÃO..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                    <select
                      value={editingItem.data.layout_type}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, layout_type: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="full">Largura total</option>
                      <option value="half">Meia largura</option>
                      <option value="third">Um terço</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="banner_active"
                      checked={editingItem.data.is_active}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, is_active: e.target.checked } })}
                      className="rounded"
                    />
                    <label htmlFor="banner_active" className="text-sm text-gray-700">Ativo</label>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (editingItem.type === 'slide') handleSaveSlide(editingItem.data);
                  else if (editingItem.type === 'carousel') handleSaveCarousel(editingItem.data);
                  else if (editingItem.type === 'banner') handleSaveBanner(editingItem.data);
                }}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
