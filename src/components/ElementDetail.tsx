import React, { useState, useEffect } from 'react';
import { ChemicalElement } from '../types/element';
import { CATEGORIES, STATE_STYLES } from '../utils/categories';
import { formatAtomicMass, calculateAtomicStructure, getShellDetails } from '../utils/chemistry';
import { trackAtom3DViewed, trackARStarted } from '../utils/learning-progress-storage';
import { BohrAtomVisualizer } from './BohrAtomVisualizer';
import { AtomicRelationCard } from './AtomicRelationCard';
import { Atom3DViewer } from './Atom3DViewer';
import { AtomARViewer } from './AtomARViewer';
import {
  TRENDS_DATA_BY_NUMBER,
  PERIODIC_PROPERTIES,
  formatPropertyValue,
  getTrendCategory,
  TREND_LEVEL_STYLES,
} from '../data/periodic-trends-data';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe2,
  Atom,
  Info,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Camera,
} from 'lucide-react';

interface ElementDetailProps {
  element: ChemicalElement;
  onClose?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  isMobileModal?: boolean;
}

export const ElementDetail: React.FC<ElementDetailProps> = ({
  element,
  onClose,
  onNavigatePrev,
  onNavigateNext,
  isMobileModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shells' | 'atom3d' | 'ar' | 'relation'>('overview');

  const catInfo = CATEGORIES[element.category];
  const stateStyle = STATE_STYLES[element.state];
  const structure = calculateAtomicStructure(element);
  const shellDetails = getShellDetails(element.electronShells);

  // Track Atom 3D and AR exploration events when active
  useEffect(() => {
    if (activeTab === 'atom3d') {
      trackAtom3DViewed(element.symbol, element.name);
    } else if (activeTab === 'ar') {
      trackARStarted(element.symbol, element.name);
    }
  }, [activeTab, element.symbol, element.name]);

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Top Header Bar with navigation & close */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-1.5">
          {onNavigatePrev && (
            <button
              type="button"
              onClick={onNavigatePrev}
              disabled={element.atomicNumber <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Unsur Sebelumnya"
              aria-label="Unsur Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-mono font-bold text-slate-400">
            Z = {element.atomicNumber} / 118
          </span>
          {onNavigateNext && (
            <button
              type="button"
              onClick={onNavigateNext}
              disabled={element.atomicNumber >= 118}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Unsur Berikutnya"
              aria-label="Unsur Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab switcher: [ Ringkasan ] [ Kulit Atom ] [ ⚛ Atom 3D ] [ Hubungan Atom ] */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-2 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ringkasan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shells')}
            className={`px-2 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'shells'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kulit Atom
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('atom3d')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              activeTab === 'atom3d'
                ? 'bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-cyan-300 border border-cyan-400/50 font-bold shadow-sm'
                : 'text-cyan-400 hover:text-cyan-200 bg-cyan-950/30 border border-cyan-900/50'
            }`}
          >
            <span>⚛ Atom 3D</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ar')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              activeTab === 'ar'
                ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-slate-950 font-black shadow-md border border-cyan-300'
                : 'text-amber-300 hover:text-amber-200 bg-amber-950/30 border border-amber-900/50'
            }`}
            title="Lihat model atom dalam lingkungan nyata menggunakan kamera smartphone (WebXR AR)"
          >
            <span>🥽 Atom AR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relation')}
            className={`px-2 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'relation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hubungan Atom
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            title="Tutup Panel"
            aria-label="Tutup Panel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Hero Card of Element */}
        <div
          className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all"
          style={{
            borderColor: `${catInfo.accentColor}55`,
            background: `radial-gradient(circle at top right, ${catInfo.accentColor}18 0%, #090d16 80%)`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-cyan-300 border border-slate-800">
                  #{element.atomicNumber}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: `${catInfo.accentColor}22`,
                    color: catInfo.accentColor,
                    borderColor: `${catInfo.accentColor}44`,
                  }}
                >
                  {element.category}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md border font-medium ${stateStyle.badge}`}
                >
                  {stateStyle.icon} {stateStyle.label}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
                {element.name}
              </h2>
              {element.latinName && (
                <p className="text-xs text-slate-400 italic">
                  Nama Latin / Alternatif: {element.latinName}
                </p>
              )}
            </div>

            {/* Giant Symbol Badge */}
            <div
              className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 shadow-2xl shrink-0"
              style={{
                borderColor: catInfo.accentColor,
                backgroundColor: '#020617',
                boxShadow: `0 10px 25px -5px ${catInfo.accentColor}33`,
              }}
            >
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {element.symbol}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-cyan-400/90">
                {formatAtomicMass(element.atomicMass)}
              </span>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">Golongan</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {element.group ?? 'Lant/Akt'}
              </span>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">Periode</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {element.period}
              </span>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">Blok</span>
              <span className="text-xs sm:text-sm font-bold text-cyan-300 font-mono uppercase">
                Blok {element.block}
              </span>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">Valensi</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                {element.valenceElectrons ?? '-'} e⁻
              </span>
            </div>
          </div>

          {/* Quick Action: Launch 3D Atom Viewer & Atom AR */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400">
              Visualisasi Interaktif:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('atom3d')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🔬 Atom 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>🥽</span>
                <span>Lihat AR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Description & Uses */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deskripsi & Karakteristik</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {element.description}
              </p>
              {element.uses && (
                <div className="pt-2 border-t border-slate-800/70 text-xs text-slate-400">
                  <strong className="text-teal-300 font-medium">Kegunaan Nyata: </strong>
                  {element.uses}
                </div>
              )}
            </div>

            {/* Electron Configuration Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Atom className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Konfigurasi Elektron</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/60">
                  Aufbau
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono font-bold text-xs sm:text-sm text-cyan-300 tracking-wide">
                {element.electronConfiguration}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Distribusi per kulit:</span>
                <span className="font-mono text-white font-semibold">
                  [{element.electronShells.join(', ')}]
                </span>
              </div>
            </div>

            {/* Subatomic Particles Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Partikel Subatomik (Atom Netral Z={element.atomicNumber})
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-medium">
                  Representasi isotop
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Proton (p⁺)</span>
                  <span className="text-sm font-bold text-rose-400 font-mono">
                    {structure.protons}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Elektron (e⁻)</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {structure.electrons}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Neutron (n⁰)*</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {structure.neutrons}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                * Jumlah neutron dihitung berdasarkan nomor massa isotop representatif paling umum (A ≈ {structure.massNumber}). Jumlah neutron bukan nilai mutlak tunggal karena keberadaan berbagai isotop alami.
              </p>
            </div>

            {/* Pedagogical disclaimer banner */}
            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2 shadow-sm">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-amber-300 font-semibold">Model Pembelajaran: </strong>
                Model atom pada aplikasi ini merupakan visualisasi pembelajaran untuk membantu memahami struktur atom dan distribusi elektron. Visualisasi ini bukan representasi literal orbital mekanika kuantum.
              </p>
            </div>

            {/* Chemical & Physical Properties Grid */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <span className="text-xs font-semibold text-slate-300 block">
                Sifat Fisik & Kimiawi
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Bilangan Oksidasi</span>
                  <span className="font-mono font-bold text-amber-300">
                    {element.oxidationStates || 'Data tidak tersedia.'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Elektronegativitas (Pauling)</span>
                  <span className="font-mono font-bold text-white">
                    {element.electronegativity !== null && element.electronegativity !== undefined
                      ? element.electronegativity
                      : 'Data tidak tersedia.'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Titik Lebur</span>
                  <span className="font-mono font-medium text-slate-200">
                    {element.meltingPoint !== null && element.meltingPoint !== undefined
                      ? `${element.meltingPoint} °C`
                      : 'Data tidak tersedia.'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Titik Didih</span>
                  <span className="font-mono font-medium text-slate-200">
                    {element.boilingPoint !== null && element.boilingPoint !== undefined
                      ? `${element.boilingPoint} °C`
                      : 'Data tidak tersedia.'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Massa Jenis / Densitas</span>
                  <span className="font-mono font-medium text-slate-200">
                    {element.density !== null && element.density !== undefined
                      ? `${element.density} g/cm³`
                      : 'Data tidak tersedia.'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tahun Penemuan</span>
                  <span className="font-mono font-medium text-slate-200">
                    {element.discoveryYear || 'Prasejarah'}
                  </span>
                </div>
              </div>

              {element.discoveredBy && (
                <div className="text-[11px] text-slate-400 pt-1">
                  <span className="text-slate-500">Ditemukan oleh: </span>
                  <span className="text-slate-300 font-medium">{element.discoveredBy}</span>
                </div>
              )}
            </div>

            {/* Sifat Keperiodikan (Periodic Trends) Card */}
            {(() => {
              const trendData = TRENDS_DATA_BY_NUMBER[element.atomicNumber];
              const properties: Array<{
                key: 'atomicRadius' | 'ionizationEnergy' | 'electronegativity' | 'electronAffinity';
                label: string;
              }> = [
                { key: 'atomicRadius', label: 'Jari-Jari Atom' },
                { key: 'ionizationEnergy', label: 'Energi Ionisasi' },
                { key: 'electronegativity', label: 'Elektronegativitas' },
                { key: 'electronAffinity', label: 'Afinitas Elektron' },
              ];

              return (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sifat Keperiodikan Unsur</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">
                      NIST & RSC Data
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {properties.map(({ key, label }) => {
                      const val = trendData?.[key];
                      const cat = getTrendCategory(key, val);
                      const style = TREND_LEVEL_STYLES[cat];
                      return (
                        <div
                          key={key}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {label}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${style.badge}`}
                            >
                              {cat === 'Data tidak tersedia' ? 'N/A' : cat}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-white text-xs">
                            {formatPropertyValue(key, val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: SHELLS & BOHR MODEL */}
        {activeTab === 'shells' && (
          <div className="space-y-4">
            {/* Visual concentric model */}
            <BohrAtomVisualizer element={element} />

            {/* Shell table details */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Rincian Distribusi Kulit Elektron (K, L, M, N, O, P, Q)
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Rumus: 2n²</span>
              </div>

              <div className="space-y-1.5">
                {shellDetails.map((shell) => (
                  <div
                    key={shell.shellLetter}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                      shell.isValence
                        ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-white text-[11px]">
                        {shell.shellLetter}
                      </span>
                      <span>Kulit ke-{shell.shellIndex + 1} (n={shell.shellIndex + 1})</span>
                      {shell.isValence && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider">
                          Kulit Terluar (Valensi)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-white font-bold">{shell.electronCount} elektron</span>
                      <span className="text-[10px] text-slate-500">
                        (Maks. {shell.maxElectrons})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Valence explanation */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300">Elektron Valensi: </strong>
              Unsur {element.name} memiliki <span className="font-bold underline">{element.valenceElectrons ?? 0} elektron</span> pada kulit terluarnya. Elektron inilah yang berperan langsung dalam pembentukan ikatan kimia (kovalen maupun ionik) dan menentukan sifat kimia khas unsur ini.
            </div>
          </div>
        )}

        {/* Tab: ATOM 3D (Phase 2 & Phase 3 Three.js Engine) */}
        {activeTab === 'atom3d' && (
          <div className="space-y-3">
            <Atom3DViewer element={element} onOpenAR={() => setActiveTab('ar')} />
          </div>
        )}

        {/* Tab: ATOM AR (Phase 5 WebXR AR Engine) */}
        {activeTab === 'ar' && (
          <div className="space-y-3">
            <AtomARViewer element={element} onBackTo3D={() => setActiveTab('atom3d')} />
          </div>
        )}

        {/* Tab: ATOMIC RELATIONSHIP (Requirement Q) */}
        {activeTab === 'relation' && (
          <div className="space-y-3">
            <AtomicRelationCard element={element} />
          </div>
        )}
      </div>

      {/* Bottom Footer Action */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <span className="font-mono text-[11px]">
          ATOM 3D • {element.symbol} ({element.name})
        </span>
        <span className="text-cyan-400 text-[11px] font-medium">Design by ZP</span>
      </div>
    </div>
  );
};
