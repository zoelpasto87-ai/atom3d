import React from 'react';
import { ChemicalElement } from '../types/element';
import { CATEGORIES } from '../utils/categories';
import { formatAtomicMass } from '../utils/chemistry';
import {
  PeriodicPropertyKey,
  TrendCategory,
  getTrendCategory,
  formatTileTrendValue,
  TREND_LEVEL_STYLES,
} from '../data/periodic-trends-data';

interface ElementTileProps {
  element: ChemicalElement;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (element: ChemicalElement) => void;
  compact?: boolean;
  trendProperty?: PeriodicPropertyKey | null;
  trendValue?: number | null;
  trendLevelFilter?: TrendCategory | 'Semua';
  compareBadgeIndex?: number | null; // 1, 2, or 3
  isCompareDisabled?: boolean;
  isCompareMode?: boolean;
}

export const ElementTile: React.FC<ElementTileProps> = ({
  element,
  isSelected,
  isDimmed,
  onSelect,
  compact = false,
  trendProperty = null,
  trendValue = null,
  trendLevelFilter = 'Semua',
  compareBadgeIndex = null,
  isCompareDisabled = false,
  isCompareMode = false,
}) => {
  const catInfo = CATEGORIES[element.category];

  // If periodic trends mode is active:
  const isTrendMode = Boolean(trendProperty);
  const trendCategory: TrendCategory = isTrendMode && trendProperty
    ? getTrendCategory(trendProperty, trendValue)
    : 'Data tidak tersedia';

  const trendStyle = isTrendMode ? TREND_LEVEL_STYLES[trendCategory] : null;

  // Level filter dimming in trends mode
  const isTrendFilteredOut =
    isTrendMode && trendLevelFilter !== 'Semua' && trendCategory !== trendLevelFilter;
  const effectivelyDimmed = isCompareDisabled || isDimmed || isTrendFilteredOut;
  const isCompareSelected = compareBadgeIndex !== null;

  // State dot color
  const stateBadgeColor = {
    Padat: 'bg-slate-400',
    Cair: 'bg-sky-400',
    Gas: 'bg-violet-400',
    Sintetis: 'bg-neutral-500',
  }[element.state];

  const accentColor = isCompareSelected
    ? '#f59e0b'
    : isTrendMode && trendStyle
    ? trendStyle.accentColor
    : catInfo.accentColor;

  const bgStyle = isCompareSelected
    ? 'bg-amber-950/40 border-amber-400/90'
    : isTrendMode && trendStyle
    ? trendStyle.bgClass
    : `${catInfo.bgLight} border-slate-800/90`;

  const formattedTrendVal = isTrendMode && trendProperty
    ? formatTileTrendValue(trendProperty, trendValue)
    : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(element)}
      aria-label={`Unsur ${element.name}, Nomor atom ${element.atomicNumber}, Simbol ${element.symbol}${
        isCompareSelected ? `, Pilihan Bandingkan #${compareBadgeIndex}` : ''
      }${isTrendMode ? `, Nilai: ${formattedTrendVal}` : `, Kategori ${element.category}`}`}
      aria-selected={isSelected || isCompareSelected}
      className={`relative group w-full text-left transition-all duration-150 rounded-lg p-1.5 flex flex-col justify-between select-none cursor-pointer border ${
        isCompareSelected
          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 border-amber-300 scale-[1.05] z-30 shadow-xl shadow-amber-500/30 bg-amber-950/50'
          : isSelected && !isCompareMode
          ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950 border-cyan-300 scale-[1.03] z-20 shadow-lg shadow-cyan-500/25 bg-slate-800'
          : effectivelyDimmed
          ? 'opacity-25 grayscale border-slate-900 bg-slate-950/40 hover:opacity-50'
          : `${bgStyle} hover:border-slate-500 hover:shadow-md hover:scale-[1.02] z-0`
      } ${compact ? 'min-h-[58px]' : 'min-h-[66px] sm:min-h-[74px]'}`}
      style={{
        borderLeftColor: isCompareSelected ? '#f59e0b' : isSelected && !isCompareMode ? '#22d3ee' : accentColor,
        borderLeftWidth: isCompareSelected ? '4px' : '3.5px',
      }}
    >
      {/* Compare Badge Overlay if selected */}
      {isCompareSelected && (
        <div className="absolute -top-2 -right-1.5 z-30 flex items-center justify-center">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-lg ring-2 ring-slate-950 animate-in zoom-in-50 duration-150">
            <span>✓</span>
            <span>{compareBadgeIndex}</span>
          </span>
        </div>
      )}

      {/* Top row: Atomic Number & Indicator Dot */}
      <div className="flex items-center justify-between w-full leading-none">
        <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 group-hover:text-slate-200">
          {element.atomicNumber}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isCompareSelected
              ? 'bg-amber-400'
              : isTrendMode && trendStyle
              ? trendStyle.dotColor
              : stateBadgeColor
          }`}
          title={
            isCompareSelected
              ? `Dipilih untuk Perbandingan (#${compareBadgeIndex})`
              : isTrendMode && trendStyle
              ? `Kategori nilai: ${trendStyle.label}`
              : `Wujud: ${element.state}`
          }
        />
      </div>

      {/* Center: Symbol (Dominant element - ALWAYS VISIBLE!) */}
      <div className="my-auto py-0.5 text-center w-full">
        <span
          className={`font-black tracking-tight leading-none transition-colors ${
            compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          } ${
            isSelected
              ? 'text-cyan-300 font-extrabold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]'
              : 'text-white group-hover:text-cyan-200'
          }`}
        >
          {element.symbol}
        </span>
      </div>

      {/* Bottom row: Element Name and Value/Mass */}
      <div className="w-full text-center leading-tight overflow-hidden">
        <div className="text-[9px] sm:text-[10px] font-medium text-slate-300 truncate w-full group-hover:text-white">
          {element.name}
        </div>
        {isTrendMode ? (
          <div
            className={`text-[8.5px] sm:text-[9.5px] font-mono font-bold truncate ${
              trendStyle ? trendStyle.textColor : 'text-slate-400'
            }`}
          >
            {formattedTrendVal}
          </div>
        ) : (
          <div className="text-[8px] sm:text-[9px] font-mono text-slate-400/90 truncate">
            {formatAtomicMass(element.atomicMass)}
          </div>
        )}
      </div>

      {/* Block tag badge or Trend unit indicator */}
      <div className="absolute top-1 right-3 text-[7px] font-mono text-slate-500 uppercase">
        {element.block}
      </div>
    </button>
  );
};
