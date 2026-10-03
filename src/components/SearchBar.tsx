import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  resultCount,
  totalCount,
}) => {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="🔎 Cari unsur (contoh: Oksigen, O, 8, Besi, Na)..."
          className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-400 text-sm transition-all outline-none"
          aria-label="Cari unsur berdasarkan nama, simbol, atau nomor atom"
        />
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[11px] font-mono text-slate-300">
            {resultCount}/{totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};
