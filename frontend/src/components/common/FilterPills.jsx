import React from 'react';

const FilterPills = ({
  items = [],
  activeItem,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none ${className}`}>
      {items.map((item) => {
        const isObject = typeof item === 'object' && item !== null;
        const value = isObject ? (item.value !== undefined ? item.value : item.id) : item;
        const label = isObject ? (item.label || item.name || value) : item;
        const Icon = isObject ? item.icon : null;
        const isSelected = activeItem === value;

        return (
          <button
            key={String(value)}
            type="button"
            onClick={() => onSelect(value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {Icon && (
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterPills;
