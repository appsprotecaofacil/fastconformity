import React, { useState, useEffect, useCallback } from 'react';
import { 
  Footprints, Save, Plus, Edit2, Trash2, Eye, EyeOff, GripVertical,
  Building2, Phone, Mail, MapPin, Clock, Share2, Link2, CreditCard, Shield,
  Smartphone, Facebook, Instagram, Twitter, Youtube, Linkedin, Music, ChevronDown, ChevronUp
} from 'lucide-react';
import { adminFooterAPI } from '../../services/adminApi';

const socialIcons = {
  Facebook: Facebook,
  Instagram: Instagram,
  Twitter: Twitter,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  TikTok: Music,
};

const AdminFooter = () => {
  const [settings, setSettings] = useState({});
  const [socialLinks, setSocialLinks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [securityBadges, setSecurityBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('company');
  const [editingItem, setEditingItem] = useState(null);
  const [expandedColumn, setExpandedColumn] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [settingsData, socialData, columnsData, paymentData, badgesData] = await Promise.all([
        adminFooterAPI.getSettings(),
        adminFooterAPI.getSocialLinks(),
        adminFooterAPI.getColumns(),
        adminFooterAPI.getPaymentMethods(),
        adminFooterAPI.getSecurityBadges()
      ]);
      setSettings(settingsData);
      setSocialLinks(socialData);
      setColumns(columnsData);
      setPaymentMethods(paymentData);
      setSecurityBadges(badgesData);
    } catch (error) {
      console.error('Error fetching footer data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminFooterAPI.updateSettings(settings);
      alert('Configurações salvas!');
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSocial = async (link) => {
    try {
      await adminFooterAPI.updateSocialLink(link.id, { ...link, is_active: !link.isActive });
      setSocialLinks(socialLinks.map(s => s.id === link.id ? { ...s, isActive: !s.isActive } : s));
    } catch (error) {
      alert('Erro ao atualizar');
    }
  };

  const handleSaveSocialLink = async (link) => {
    setSaving(true);
    try {
      await adminFooterAPI.updateSocialLink(link.id, link);
      fetchData();
      setEditingItem(null);
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePayment = async (method) => {
    try {
      await adminFooterAPI.updatePaymentMethod(method.id, { ...method, is_active: !method.isActive });
      setPaymentMethods(paymentMethods.map(p => p.id === method.id ? { ...p, isActive: !p.isActive } : p));
    } catch (error) {
      alert('Erro ao atualizar');
    }
  };

  const handleSaveColumn = async (column) => {
    setSaving(true);
    try {
      if (column.id) {
        await adminFooterAPI.updateColumn(column.id, column);
      } else {
        await adminFooterAPI.createColumn(column);
      }
      fetchData();
      setEditingItem(null);
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteColumn = async (id) => {
    if (!window.confirm('Remover esta coluna e todos os links?')) return;
    try {
      await adminFooterAPI.deleteColumn(id);
      setColumns(columns.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao remover');
    }
  };

  const handleSaveLink = async (link) => {
    setSaving(true);
    try {
      if (link.id) {
        await adminFooterAPI.updateLink(link.id, link);
      } else {
        await adminFooterAPI.createLink(link);
      }
      fetchData();
      setEditingItem(null);
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Remover este link?')) return;
    try {
      await adminFooterAPI.deleteLink(id);
      fetchData();
    } catch (error) {
      alert('Erro ao remover');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sections = [
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'contact', label: 'Contato', icon: Phone },
    { id: 'social', label: 'Redes Sociais', icon: Share2 },
    { id: 'links', label: 'Menus de Links', icon: Link2 },
    { id: 'payment', label: 'Pagamento', icon: CreditCard },
    { id: 'security', label: 'Selos', icon: Shield },
    { id: 'apps', label: 'Apps', icon: Smartphone },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Footprints className="text-indigo-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Rodapé</h1>
            <p className="text-gray-500 text-sm">Configure todas as seções do rodapé</p>
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

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border shadow-sm p-2 sticky top-6">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon size={18} />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Company Section */}
          {activeSection === 'company' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-indigo-600" />
                Informações da Empresa
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={settings.company_name || ''}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Slogan</label>
                  <textarea
                    value={settings.company_description || ''}
                    onChange={(e) => setSettings({ ...settings, company_description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ (opcional)</label>
                  <input
                    type="text"
                    value={settings.company_cnpj || ''}
                    onChange={(e) => setSettings({ ...settings, company_cnpj: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL do Logo (opcional)</label>
                  <input
                    type="text"
                    value={settings.company_logo || ''}
                    onChange={(e) => setSettings({ ...settings, company_logo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto de Copyright</label>
                  <input
                    type="text"
                    value={settings.copyright_text || ''}
                    onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    placeholder="© {year} Empresa. Todos os direitos reservados."
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {'{year}'} para o ano atual</p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone size={20} className="text-indigo-600" />
                Informações de Contato
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={settings.contact_phone || ''}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="(11) 9999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={settings.contact_whatsapp || ''}
                      onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="5511999999999"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={settings.contact_address || ''}
                    onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Atendimento</label>
                  <input
                    type="text"
                    value={settings.contact_hours || ''}
                    onChange={(e) => setSettings({ ...settings, contact_hours: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Seg-Sex: 9h às 18h"
                  />
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

          {/* Social Links Section */}
          {activeSection === 'social' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 size={20} className="text-indigo-600" />
                Redes Sociais
              </h2>
              <div className="space-y-3">
                {socialLinks.map(link => {
                  const Icon = socialIcons[link.platform] || Share2;
                  return (
                    <div key={link.id} className={`flex items-center gap-4 p-4 rounded-lg border ${link.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                      <Icon size={24} className="text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{link.platform}</p>
                        <input
                          type="text"
                          value={link.url || ''}
                          onChange={(e) => setSocialLinks(socialLinks.map(s => s.id === link.id ? { ...s, url: e.target.value } : s))}
                          className="w-full mt-1 px-3 py-1.5 border rounded text-sm"
                          placeholder={`URL do ${link.platform}`}
                        />
                      </div>
                      <button
                        onClick={() => handleToggleSocial(link)}
                        className={`p-2 rounded-lg ${link.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        {link.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => handleSaveSocialLink(link)}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Salvar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Link Columns Section */}
          {activeSection === 'links' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Colunas de Links</h2>
                <button
                  onClick={() => setEditingItem({ type: 'column', data: { title: '', is_active: true } })}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  Nova Coluna
                </button>
              </div>

              {columns.map(column => (
                <div key={column.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedColumn(expandedColumn === column.id ? null : column.id)}
                  >
                    <GripVertical size={18} className="text-gray-400" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{column.title}</h3>
                      <p className="text-sm text-gray-500">{column.links?.length || 0} links</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'column', data: column }); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteColumn(column.id); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                    {expandedColumn === column.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {expandedColumn === column.id && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Links desta coluna</span>
                        <button
                          onClick={() => setEditingItem({ type: 'link', data: { column_id: column.id, label: '', url: '', is_active: true } })}
                          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Adicionar Link
                        </button>
                      </div>
                      <div className="space-y-2">
                        {column.links?.map(link => (
                          <div key={link.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                            <span className="flex-1 text-sm">{link.label}</span>
                            <span className="text-xs text-gray-400">{link.url}</span>
                            <button
                              onClick={() => setEditingItem({ type: 'link', data: { ...link, column_id: column.id } })}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {(!column.links || column.links.length === 0) && (
                          <p className="text-sm text-gray-400 text-center py-2">Nenhum link nesta coluna</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Payment Methods Section */}
          {activeSection === 'payment' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-600" />
                  Formas de Pagamento
                </h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.payment_methods_enabled === 'true'}
                    onChange={(e) => {
                      const newSettings = { ...settings, payment_methods_enabled: e.target.checked ? 'true' : 'false' };
                      setSettings(newSettings);
                      adminFooterAPI.updateSettings(newSettings);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Exibir no rodapé</span>
                </label>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    onClick={() => handleTogglePayment(method)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      method.isActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Badges Section */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-indigo-600" />
                  Selos de Segurança
                </h2>
                <button
                  onClick={() => setEditingItem({ type: 'badge', data: { name: '', image_url: '', link_url: '', is_active: true } })}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus size={16} />
                  Adicionar Selo
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {securityBadges.map(badge => (
                  <div key={badge.id} className="p-4 rounded-xl border bg-gray-50 text-center relative group">
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name} className="h-12 mx-auto mb-2 object-contain" />
                    ) : (
                      <Shield size={40} className="mx-auto mb-2 text-gray-300" />
                    )}
                    <p className="text-sm text-gray-600">{badge.name}</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => setEditingItem({ type: 'badge', data: badge })}
                        className="p-1 bg-white rounded shadow text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Remover este selo?')) {
                            await adminFooterAPI.deleteSecurityBadge(badge.id);
                            fetchData();
                          }
                        }}
                        className="p-1 bg-white rounded shadow text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {securityBadges.length === 0 && (
                  <p className="col-span-4 text-center text-gray-400 py-8">Nenhum selo cadastrado</p>
                )}
              </div>
            </div>
          )}

          {/* Apps Section */}
          {activeSection === 'apps' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Smartphone size={20} className="text-indigo-600" />
                  Links para Apps
                </h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.apps_enabled === 'true'}
                    onChange={(e) => {
                      const newSettings = { ...settings, apps_enabled: e.target.checked ? 'true' : 'false' };
                      setSettings(newSettings);
                      adminFooterAPI.updateSettings(newSettings);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Exibir no rodapé</span>
                </label>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">App Store (iOS)</label>
                  <input
                    type="text"
                    value={settings.app_ios_url || ''}
                    onChange={(e) => setSettings({ ...settings, app_ios_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="https://apps.apple.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Play (Android)</label>
                  <input
                    type="text"
                    value={settings.app_android_url || ''}
                    onChange={(e) => setSettings({ ...settings, app_android_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="https://play.google.com/store/apps/..."
                  />
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem.data.id ? 'Editar' : 'Novo'} {
                  editingItem.type === 'column' ? 'Coluna' :
                  editingItem.type === 'link' ? 'Link' : 'Selo'
                }
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {editingItem.type === 'column' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da Coluna</label>
                  <input
                    type="text"
                    value={editingItem.data.title}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Ex: Institucional"
                  />
                </div>
              )}

              {editingItem.type === 'link' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Link</label>
                    <input
                      type="text"
                      value={editingItem.data.label}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, label: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Ex: Sobre nós"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                      type="text"
                      value={editingItem.data.url}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, url: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="/about ou https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_external"
                      checked={editingItem.data.is_external || editingItem.data.isExternal}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, is_external: e.target.checked } })}
                      className="rounded"
                    />
                    <label htmlFor="is_external" className="text-sm text-gray-700">Link externo (abre em nova aba)</label>
                  </div>
                </>
              )}

              {editingItem.type === 'badge' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Selo</label>
                    <input
                      type="text"
                      value={editingItem.data.name}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Ex: Site Seguro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <input
                      type="text"
                      value={editingItem.data.image_url || editingItem.data.imageUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, image_url: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                    <input
                      type="text"
                      value={editingItem.data.link_url || editingItem.data.linkUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, link_url: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="URL ao clicar no selo"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (editingItem.type === 'column') handleSaveColumn(editingItem.data);
                  else if (editingItem.type === 'link') handleSaveLink(editingItem.data);
                  else if (editingItem.type === 'badge') {
                    const badgeData = editingItem.data;
                    if (badgeData.id) {
                      adminFooterAPI.updateSecurityBadge(badgeData.id, badgeData).then(() => {
                        fetchData();
                        setEditingItem(null);
                      });
                    } else {
                      adminFooterAPI.createSecurityBadge(badgeData).then(() => {
                        fetchData();
                        setEditingItem(null);
                      });
                    }
                  }
                }}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFooter;
