import React, { createContext, useContext, useState, useEffect } from 'react';
import { displaySettingsAPI } from '../services/api';

const DisplaySettingsContext = createContext();

export const useDisplaySettings = () => {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    // Return default settings if context is not available
    return {
      settings: {
        show_price: true,
        show_original_price: true,
        show_discount: true,
        show_installments: true,
        show_free_shipping: true,
        show_specs: true,
        show_brand: true,
        show_condition: true,
        show_stock: true,
        show_sold: true,
        show_rating: true,
        show_reviews_count: true,
        show_action_button: true,
        show_seller_info: true
      },
      getDisplayValue: () => true,
      loading: false
    };
  }
  return context;
};

export const DisplaySettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    show_price: true,
    show_original_price: true,
    show_discount: true,
    show_installments: true,
    show_free_shipping: true,
    show_specs: true,
    show_brand: true,
    show_condition: true,
    show_stock: true,
    show_sold: true,
    show_rating: true,
    show_reviews_count: true,
    show_action_button: true,
    show_seller_info: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await displaySettingsAPI.get();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching display settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Get display value considering product overrides
  const getDisplayValue = (key, productOverrides = null) => {
    if (productOverrides && key in productOverrides) {
      return productOverrides[key];
    }
    return settings[key] ?? true;
  };

  return (
    <DisplaySettingsContext.Provider value={{ settings, getDisplayValue, loading }}>
      {children}
    </DisplaySettingsContext.Provider>
  );
};

export default DisplaySettingsContext;
