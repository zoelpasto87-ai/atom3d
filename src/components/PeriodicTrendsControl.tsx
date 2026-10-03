import React from 'react';
import {
  PeriodicPropertyKey,
  PERIODIC_PROPERTIES,
  PROPERTY_TERTILES,
  TrendCategory,
  TREND_LEVEL_STYLES,
} from '../data/periodic-trends-data';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowDown,
  Info,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Magnet,
  CircleDot,
  RotateCcw,
  Scale,
} from 'lucide-react';

interface PeriodicTrendsControlProps {
  activeProperty: PeriodicPropertyKey;
  onSelectProperty: (prop: PeriodicPropertyKey) => void;
  levelFilter: TrendCategory | 'Semua';
  onSelectLevelFilter: (level: TrendCategory | 'Semua') => void;
  onResetToStandard?: () => void;
  onOpenCompareMode?: () => void;
  isCompareModeActive?: boolean;
}

const PROPERTY_CONFIG: Array<{
  key: PeriodicPropertyKey;
  label: string;
  icon: React.ReactNode;
  gradient: string;
}> = [
  {
    key: 'atomicRadius',
    label: 'Jari-jari Atom',
    icon: <CircleDot className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'ionizationEnergy',
    label: 'Energi Ionisasi',
    icon: <Zap className="w-4 h-4" />,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    key: 'electronegativity',
    label: 'Elektronegativitas',
    icon: <Magnet className="w-4 h-4" />,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    key: 'electronAffinity',
    label: 'Afinitas Elektron',
    icon: <Sparkles className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export const PeriodicTrendsControl: React.FC<PeriodicTrendsControlProps> = ({
  activeProperty,
  onSelectProperty,
  levelFilter,
  onSelectLevelFilter,
  onResetToStandard,
  onOpenCompareMode,
  isCompareModeActive = false,
}) => {
  const meta = PERIODIC_PROPERTIES[activeProperty];
  const tertiles = PROPERTY_TERTILES[activeProperty];

  return (
    <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 sm:p-4 backdrop-blur-md shadow-xl space-y-3.5">
      {/* Top Header: Title & Selector Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase">
                Periodic Trends Explorer
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                Phase 4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualisasi kuantitatif sifat keperiodikan 118 unsur berbasis data numerik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {onOpenCompareMode && (
            <button
              type="button"
              onClick={onOpenCompareMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md ${
                isCompareModeActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/30'
                  : 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border-amber-500/40'
              }`}
              title="Bandingkan 3 unsur dari tabel periodik secara berdampingan"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>⚖ Bandingkan 3 Unsur</span>
            </button>
          )}

          {onResetToStandard && (
            <button
              type="button"
              onClick={onResetToStandard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all cursor-pointer"
              title="Kembali ke tampilan tabel periodik standar berbasis kategori"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tabel Standar</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Main Property Selectors */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Pilih Sifat Keperiodikan:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PROPERTY_CONFIG.map(({ key, label, icon }) => {
            const isActive = activeProperty === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectProperty(key)}
                className={`relative flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-900 to-slate-850 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/20'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800/60 text-slate-500'
                  }`}
                >
                  {icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold block truncate text-slate-100">
                    {label}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/90 block">
                    {PERIODIC_PROPERTIES[key].symbolNotation}{' '}
                    {PERIODIC_PROPERTIES[key].unit
                      ? `(${PERIODIC_PROPERTIES[key].unit})`
                      : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Property Details & Educational Trend Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
        {/* Left: Scientific Trend Summary */}
        <div className="lg:col-span-8 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{meta.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                Simbol: {meta.symbolNotation}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Sumber: {meta.source}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {meta.description}
          </p>

          {/* Directional Trends in Periodic Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2">
              <div className="p-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 shrink-0 mt-0.5">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Dalam Satu Periode (Kiri ke Kanan →)
                </span>
                <span className="font-semibold text-cyan-300 text-xs">
                  {meta.periodTrend}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2">
              <div className="p-1 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 shrink-0 mt-0.5">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Dalam Satu Golongan (Atas ke Bawah ↓)
                </span>
                <span className="font-semibold text-indigo-300 text-xs">
                  {meta.groupTrend}
                </span>
              </div>
            </div>
          </div>

          {/* Scientific Reason */}
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300/90 leading-relaxed">
            <strong className="text-teal-300 font-semibold">Mengapa demikian? </strong>
            {meta.scientificReason}
          </div>
        </div>

        {/* Right: Color Legend & Interactive Level Filter */}
        <div className="lg:col-span-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Skala & Filter Nilai</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {tertiles.count} unsur terukur
              </span>
            </div>

            {/* Continuous Color Gradient Bar */}
            <div className="h-3 rounded-full bg-gradient-to-r from-sky-500 via-amber-400 to-rose-500 shadow-inner my-1.5 border border-slate-700/60" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Min: {tertiles.min.toFixed(1)}</span>
              <span>Q1: {tertiles.q1.toFixed(1)}</span>
              <span>Q2: {tertiles.q2.toFixed(1)}</span>
              <span>Max: {tertiles.max.toFixed(1)}</span>
            </div>
          </div>

          {/* Level Filter Buttons */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block">
              Sorot Kategori Nilai:
            </span>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => onSelectLevelFilter('Semua')}
                className={`py-1 px-1.5 rounded-lg text-center font-bold transition-all cursor-pointer border ${
                  levelFilter === 'Semua'
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
              {(['RENDAH', 'SEDANG', 'TINGGI'] as TrendCategory[]).map((level) => {
                const style = TREND_LEVEL_STYLES[level];
                const isActive = levelFilter === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onSelectLevelFilter(level)}
                    className={`py-1 px-1.5 rounded-lg text-center font-bold transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                      isActive
                        ? `${style.badge} ring-1 ring-white/30`
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
                    <span>{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
