import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/mock';
import * as Icons from 'lucide-react';

const CategoryGrid = () => {
  const getIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={32} /> : <Icons.Package size={32} />;
  };

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
