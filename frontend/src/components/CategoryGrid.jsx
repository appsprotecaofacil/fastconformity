import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import * as Icons from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const CategoryGrid = ({ showTitle = true, title, subtitle, selectedCategories = [], maxItems = 12 }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const getIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={28} /> : <Icons.Package size={28} />;
  };

  if (categories.length === 0) {
    return null;
  }

  // Filter categories if selectedCategories is provided
  let displayCategories = categories;
  if (selectedCategories && selectedCategories.length > 0) {
    displayCategories = categories.filter(cat => selectedCategories.includes(cat.id));
    // Sort by the order in selectedCategories
    displayCategories.sort((a, b) => selectedCategories.indexOf(a.id) - selectedCategories.indexOf(b.id));
  }
  
  // Limit to maxItems
  displayCategories = displayCategories.slice(0, maxItems);

  return (
    <div className="bg-white py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        {showTitle && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
              {title || 'Categorias em Destaque'}
            </h2>
            {subtitle && (
              <p className="text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/search?category=${category.slug}`}
              className="group flex flex-col items-center p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
            >
              <div 
                className="w-14 h-14 mb-3 rounded-2xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${colors.accent}15` }}
              >
                <span 
                  className="transition-colors"
                  style={{ color: colors.primary }}
                >
                  {getIcon(category.icon)}
                </span>
              </div>
              <span className="text-sm text-center text-gray-700 font-medium group-hover:text-[#FF6B35] transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
