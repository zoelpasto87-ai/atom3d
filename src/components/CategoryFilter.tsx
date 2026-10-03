import React from 'react';
import { ElementCategory } from '../types/element';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';
import { ELEMENTS } from '../data/elements';

interface CategoryFilterProps {
  selectedCategory: ElementCategory | 'Semua';
  onSelectCategory: (category: ElementCategory | 'Semua') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  // Pre-calculate count for each category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { Semua: ELEMENTS.length };
    ELEMENTS.forEach((el) => {
      counts[el.category] = (counts[el.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="w-full">
      {/* Scrollable pill container with clean scrollbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* 'Semua' option */}
        <button
          type="button"
          onClick={() => onSelectCategory('Semua')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer ${
            selectedCategory === 'Semua'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <span>Semua Unsur</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCategory === 'Semua'
                ? 'bg-slate-950/20 text-slate-950'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {categoryCounts['Semua']}
          </span>
        </button>

        {/* 10 Categories */}
        {CATEGORY_LIST.map((cat) => {
          const info = CATEGORIES[cat];
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer border ${
                isSelected
                  ? `${info.bgSolid} text-slate-950 font-bold shadow-md border-transparent`
                  : `bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white`
              }`}
              title={info.description}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isSelected ? 'bg-slate-950' : info.dotColor
                }`}
              />
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
