import React, { useRef } from 'react';
import { ChemicalElement, ElementCategory } from '../types/element';
import { ElementTile } from './ElementTile';
import { ELEMENTS, getElementByNumber } from '../data/elements';
import { ArrowRight, HelpCircle } from 'lucide-react';
import {
  PeriodicPropertyKey,
  TrendCategory,
  TRENDS_DATA_BY_NUMBER,
} from '../data/periodic-trends-data';

interface PeriodicTableProps {
  selectedElement: ChemicalElement;
  onSelectElement: (element: ChemicalElement) => void;
  filteredElements: ChemicalElement[];
  searchQuery: string;
  selectedCategory: ElementCategory | 'Semua';
  viewMode: 'grid' | 'list';
  trendProperty?: PeriodicPropertyKey | null;
  trendLevelFilter?: TrendCategory | 'Semua';
  isCompareMode?: boolean;
  selectedCompareElements?: ChemicalElement[];
  onToggleCompareElement?: (element: ChemicalElement) => void;
}

const GROUPS = [
  { num: 1, label: 'IA', name: 'Alkali' },
  { num: 2, label: 'IIA', name: 'Alkali Tanah' },
  { num: 3, label: 'IIIB', name: '' },
  { num: 4, label: 'IVB', name: '' },
  { num: 5, label: 'VB', name: '' },
  { num: 6, label: 'VIB', name: '' },
  { num: 7, label: 'VIIB', name: '' },
  { num: 8, label: 'VIIIB', name: '' },
  { num: 9, label: 'VIIIB', name: '' },
  { num: 10, label: 'VIIIB', name: '' },
  { num: 11, label: 'IB', name: 'Koin' },
  { num: 12, label: 'IIB', name: 'Seng' },
  { num: 13, label: 'IIIA', name: 'Boron' },
  { num: 14, label: 'IVA', name: 'Karbon' },
  { num: 15, label: 'VA', name: 'Pniktogen' },
  { num: 16, label: 'VIA', name: 'Kalkogen' },
  { num: 17, label: 'VIIA', name: 'Halogen' },
  { num: 18, label: 'VIIIA', name: 'Gas Mulia' },
];

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  selectedElement,
  onSelectElement,
  filteredElements,
  searchQuery,
  selectedCategory,
  viewMode,
  trendProperty = null,
  trendLevelFilter = 'Semua',
  isCompareMode = false,
  selectedCompareElements = [],
  onToggleCompareElement,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to compute compare status for any element
  const getCompareStatus = (el: ChemicalElement) => {
    if (!isCompareMode) {
      return { compareBadgeIndex: null, isCompareDisabled: false, clickHandler: onSelectElement };
    }
    const idx = selectedCompareElements
      ? selectedCompareElements.findIndex((item) => item.atomicNumber === el.atomicNumber)
      : -1;
    const compareBadgeIndex = idx !== -1 ? idx + 1 : null;
    const isFull = (selectedCompareElements?.length ?? 0) >= 3;
    const isCompareDisabled = isFull && idx === -1;
    const clickHandler = onToggleCompareElement || onSelectElement;
    return { compareBadgeIndex, isCompareDisabled, clickHandler };
  };

  // Set of matched element numbers for fast dimming
  const matchedNumbers = React.useMemo(() => {
    return new Set(filteredElements.map((el) => el.atomicNumber));
  }, [filteredElements]);

  // Is filtering active?
  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== 'Semua';

  if (filteredElements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
        <HelpCircle className="w-12 h-12 text-cyan-400/50 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Unsur tidak ditemukan.</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Tidak ada unsur yang cocok dengan kata kunci &quot;{searchQuery}&quot; pada kategori &quot;{selectedCategory}&quot;. Coba periksa kembali ejaan simbol atau nama unsur.
        </p>
      </div>
    );
  }

  // LIST / EXPLORER VIEW (Optimized for fast vertical scrolling on mobile)
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Menampilkan {filteredElements.length} dari 118 unsur</span>
          <span className="font-mono">
            {isCompareMode
              ? 'Mode Pemilihan Bandingkan 3 Unsur'
              : trendProperty
              ? 'Mode Sifat Keperiodikan'
              : 'Mode Kartu Vertikal'}
          </span>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {filteredElements.map((el) => {
            const trendVal = trendProperty
              ? TRENDS_DATA_BY_NUMBER[el.atomicNumber]?.[trendProperty] ?? null
              : null;
            const { compareBadgeIndex, isCompareDisabled, clickHandler } = getCompareStatus(el);
            return (
              <ElementTile
                key={el.atomicNumber}
                element={el}
                isSelected={selectedElement.atomicNumber === el.atomicNumber}
                isDimmed={false}
                onSelect={clickHandler}
                compact
                trendProperty={trendProperty}
                trendValue={trendVal}
                trendLevelFilter={trendLevelFilter}
                compareBadgeIndex={compareBadgeIndex}
                isCompareDisabled={isCompareDisabled}
                isCompareMode={isCompareMode}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // MODERN PERIODIC TABLE GRID (18 cols, periods 1-7 + Lanthanides/Actinides)
  return (
    <div className="relative w-full rounded-2xl bg-slate-950/70 border border-slate-800/80 p-2 sm:p-3 overflow-hidden shadow-xl">
      {/* Mobile scroll indicator banner */}
      <div className="flex items-center justify-between pb-2 px-1 text-[11px] text-slate-400 lg:hidden">
        <span className="text-cyan-400/90 font-medium flex items-center gap-1">
          <span>Sentuh & geser tabel ke samping</span>
          <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
        </span>
        <span className="font-mono text-slate-500">18 Golongan • 7 Periode</span>
      </div>

      {/* Responsive Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950/50"
      >
        <div className="min-w-[960px] select-none">
          {/* Group column header labels (1 to 18) */}
          <div className="grid grid-cols-[36px_repeat(18,minmax(48px,1fr))] gap-1 mb-1 text-center font-mono">
            <div className="text-[10px] text-slate-600 flex items-center justify-center font-bold">
              Gol
            </div>
            {GROUPS.map((g) => (
              <div
                key={`group-${g.num}`}
                className="flex flex-col items-center justify-center p-0.5 rounded bg-slate-900/40 border border-slate-800/40 text-slate-400"
              >
                <span className="text-[10px] font-bold text-slate-300">{g.num}</span>
                <span className="text-[8px] text-cyan-400/80 font-sans leading-none">{g.label}</span>
              </div>
            ))}
          </div>

          {/* Periods 1 to 7 Rows */}
          {[1, 2, 3, 4, 5, 6, 7].map((period) => (
            <div
              key={`period-${period}`}
              className="grid grid-cols-[36px_repeat(18,minmax(48px,1fr))] gap-1 mb-1 items-stretch"
            >
              {/* Period Number Label on the Left */}
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 font-mono">
                <span className="text-[9px] text-slate-500 leading-none">Per</span>
                <span className="text-xs font-bold text-white">{period}</span>
              </div>

              {/* 18 Columns in this Period */}
              {Array.from({ length: 18 }, (_, colIndex) => {
                const group = colIndex + 1;

                // Special handling for row 6 and row 7 f-block placeholders
                if (period === 6 && group === 3) {
                  return (
                    <div
                      key="lanthanide-placeholder"
                      className="p-1 rounded-lg border border-pink-500/30 bg-pink-950/20 text-center flex flex-col justify-center items-center min-h-[66px] sm:min-h-[74px]"
                    >
                      <span className="text-[9px] font-mono font-bold text-pink-300">57–71</span>
                      <span className="text-xs font-extrabold text-pink-400">La–Lu</span>
                      <span className="text-[8px] text-slate-400">Lantanida</span>
                    </div>
                  );
                }

                if (period === 7 && group === 3) {
                  return (
                    <div
                      key="actinide-placeholder"
                      className="p-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/20 text-center flex flex-col justify-center items-center min-h-[66px] sm:min-h-[74px]"
                    >
                      <span className="text-[9px] font-mono font-bold text-fuchsia-300">89–103</span>
                      <span className="text-xs font-extrabold text-fuchsia-400">Ac–Lr</span>
                      <span className="text-[8px] text-slate-400">Aktinida</span>
                    </div>
                  );
                }

                // Find element that belongs to (period, group)
                const element = ELEMENTS.find(
                  (el) => el.period === period && el.group === group
                );

                if (!element) {
                  // Empty space in periodic table
                  return <div key={`empty-${period}-${group}`} className="w-full" />;
                }

                const isDimmed = isFiltering && !matchedNumbers.has(element.atomicNumber);
                const isSelected = selectedElement.atomicNumber === element.atomicNumber;
                const trendVal = trendProperty
                  ? TRENDS_DATA_BY_NUMBER[element.atomicNumber]?.[trendProperty] ?? null
                  : null;
                const { compareBadgeIndex, isCompareDisabled, clickHandler } = getCompareStatus(element);

                return (
                  <ElementTile
                    key={`tile-${element.atomicNumber}`}
                    element={element}
                    isSelected={isSelected}
                    isDimmed={isDimmed}
                    onSelect={clickHandler}
                    trendProperty={trendProperty}
                    trendValue={trendVal}
                    trendLevelFilter={trendLevelFilter}
                    compareBadgeIndex={compareBadgeIndex}
                    isCompareDisabled={isCompareDisabled}
                    isCompareMode={isCompareMode}
                  />
                );
              })}
            </div>
          ))}

          {/* Spacer between main table and f-block */}
          <div className="h-4" />

          {/* Lanthanides Series (Row 9, numbers 57 to 71) */}
          <div className="grid grid-cols-[36px_repeat(18,minmax(48px,1fr))] gap-1 mb-1 items-stretch">
            {/* Label */}
            <div className="col-span-1" />
            <div className="col-span-2 flex items-center justify-end pr-2 text-right">
              <span className="text-[10px] font-bold text-pink-400 tracking-wide uppercase">
                Lantanida
              </span>
            </div>

            {/* 15 Lanthanides elements (57 to 71) occupy 15 columns */}
            {Array.from({ length: 15 }, (_, i) => {
              const atomicNum = 57 + i;
              const element = getElementByNumber(atomicNum);
              if (!element) return <div key={`lan-${atomicNum}`} />;

              const isDimmed = isFiltering && !matchedNumbers.has(element.atomicNumber);
              const isSelected = selectedElement.atomicNumber === element.atomicNumber;
              const trendVal = trendProperty
                ? TRENDS_DATA_BY_NUMBER[element.atomicNumber]?.[trendProperty] ?? null
                : null;
              const { compareBadgeIndex, isCompareDisabled, clickHandler } = getCompareStatus(element);

              return (
                <ElementTile
                  key={`tile-lan-${element.atomicNumber}`}
                  element={element}
                  isSelected={isSelected}
                  isDimmed={isDimmed}
                  onSelect={clickHandler}
                  trendProperty={trendProperty}
                  trendValue={trendVal}
                  trendLevelFilter={trendLevelFilter}
                  compareBadgeIndex={compareBadgeIndex}
                  isCompareDisabled={isCompareDisabled}
                  isCompareMode={isCompareMode}
                />
              );
            })}
            <div className="col-span-1" />
          </div>

          {/* Actinides Series (Row 10, numbers 89 to 103) */}
          <div className="grid grid-cols-[36px_repeat(18,minmax(48px,1fr))] gap-1 mb-1 items-stretch">
            {/* Label */}
            <div className="col-span-1" />
            <div className="col-span-2 flex items-center justify-end pr-2 text-right">
              <span className="text-[10px] font-bold text-fuchsia-400 tracking-wide uppercase">
                Aktinida
              </span>
            </div>

            {/* 15 Actinides elements (89 to 103) occupy 15 columns */}
            {Array.from({ length: 15 }, (_, i) => {
              const atomicNum = 89 + i;
              const element = getElementByNumber(atomicNum);
              if (!element) return <div key={`act-${atomicNum}`} />;

              const isDimmed = isFiltering && !matchedNumbers.has(element.atomicNumber);
              const isSelected = selectedElement.atomicNumber === element.atomicNumber;
              const trendVal = trendProperty
                ? TRENDS_DATA_BY_NUMBER[element.atomicNumber]?.[trendProperty] ?? null
                : null;
              const { compareBadgeIndex, isCompareDisabled, clickHandler } = getCompareStatus(element);

              return (
                <ElementTile
                  key={`tile-act-${element.atomicNumber}`}
                  element={element}
                  isSelected={isSelected}
                  isDimmed={isDimmed}
                  onSelect={clickHandler}
                  trendProperty={trendProperty}
                  trendValue={trendVal}
                  trendLevelFilter={trendLevelFilter}
                  compareBadgeIndex={compareBadgeIndex}
                  isCompareDisabled={isCompareDisabled}
                  isCompareMode={isCompareMode}
                />
              );
            })}
            <div className="col-span-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
