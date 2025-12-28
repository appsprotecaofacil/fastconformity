import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import * as Icons from 'lucide-react';

const CategoryGrid = () => {
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
    return Icon ? <Icon size={32} /> : <Icons.Package size={32} />;
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/search?category=${category.slug}`}
            className="flex flex-col items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="text-gray-600 group-hover:text-[#3483FA] transition-colors mb-2">
              {getIcon(category.icon)}
            </div>
            <span className="text-xs text-center text-gray-600 group-hover:text-[#3483FA]">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
