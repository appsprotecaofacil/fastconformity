import React, { useState, useEffect } from 'react';
import { adminDisplaySettingsAPI } from '../../services/adminApi';
import { Settings, Save, Eye, EyeOff, DollarSign, Truck, Package, MessageSquare, Store, RotateCcw } from 'lucide-react';

const groupIcons = {
  price: DollarSign,
  delivery: Truck,
  product: Package,
  interaction: MessageSquare,
  seller: Store
};

const groupLabels = {
  price: 'Informações de Preço',
  delivery: 'Entrega',
  product: 'Informações do Produto',
  interaction: 'Interação',
  seller: 'Vendedor'
};

const AdminDisplaySettings = () => {
  const [settings, setSettings] = useState({});
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminDisplaySettingsAPI.getAll();
      setSettings(data.settings);
      setOriginalSettings(data.settings);
      setGroups(data.groups);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));
      await adminDisplaySettingsAPI.update({ settings: settingsArray });
      setOriginalSettings(settings);
      setHasChanges(false);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const toggleAll = (groupKey, value) => {
    const groupSettings = groups[groupKey];
    const newSettings = { ...settings };
    groupSettings.forEach(setting => {
      newSettings[setting.key] = value;
    });
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupOrder = ['price', 'delivery', 'product', 'interaction', 'seller'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Settings className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações de Exibição</h1>
            <p className="text-gray-500 text-sm">Controle quais campos aparecem nos produtos</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={18} />
              Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Eye className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-blue-900">Configurações Globais</h3>
            <p className="text-sm text-blue-700 mt-1">
              Estas configurações definem o padrão de exibição para todos os produtos. 
              Você pode sobrescrever estas configurações individualmente em cada produto.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {groupOrder.map(groupKey => {
          const groupSettings = groups[groupKey];
          if (!groupSettings) return null;
          
          const GroupIcon = groupIcons[groupKey] || Package;
          const groupLabel = groupLabels[groupKey] || groupKey;
          const enabledCount = groupSettings.filter(s => settings[s.key]).length;
          const allEnabled = enabledCount === groupSettings.length;
          const noneEnabled = enabledCount === 0;

          return (
            <div key={groupKey} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <GroupIcon className="text-gray-600" size={20} />
                  <div>
                    <h2 className="font-semibold text-gray-900">{groupLabel}</h2>
                    <p className="text-xs text-gray-500">
                      {enabledCount} de {groupSettings.length} campos visíveis
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAll(groupKey, true)}
                    disabled={allEnabled}
                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    Mostrar todos
                  </button>
                  <button
                    onClick={() => toggleAll(groupKey, false)}
                    disabled={noneEnabled}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Ocultar todos
                  </button>
                </div>
              </div>
              
              <div className="divide-y">
                {groupSettings.map(setting => (
                  <div 
                    key={setting.key} 
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {settings[setting.key] ? (
                        <Eye className="text-green-500" size={18} />
                      ) : (
                        <EyeOff className="text-gray-400" size={18} />
                      )}
                      <span className={`${settings[setting.key] ? 'text-gray-900' : 'text-gray-500'}`}>
                        {setting.label}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[setting.key]}
                        onChange={() => handleToggle(setting.key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Changes Indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Alterações não salvas
        </div>
      )}
    </div>
  );
};

export default AdminDisplaySettings;
