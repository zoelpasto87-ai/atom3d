import React from 'react';
import {
  BookOpen,
  Sparkles,
  Atom,
  Layers,
  TrendingUp,
  FlaskConical,
  Compass,
  Target,
  BarChart3,
  Smartphone,
  Info,
} from 'lucide-react';
import { TOTAL_ELEMENTS_COUNT } from '../data/elements';

interface HeaderProps {
  onOpenLearning: () => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  activeMode: 'standard' | 'trends' | 'lab' | 'journey' | 'assessment' | 'progress';
  onToggleActiveMode: (mode: 'standard' | 'trends' | 'lab' | 'journey' | 'assessment' | 'progress') => void;
  onOpenInstallGuide: () => void;
  onOpenAbout: () => void;
  isInstalled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLearning,
  viewMode,
  onToggleViewMode,
  activeMode,
  onToggleActiveMode,
  onOpenInstallGuide,
  onOpenAbout,
  isInstalled = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Atom className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>ATOM</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">3D</span>
                </h1>
                <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-950 via-teal-950 to-indigo-950 text-cyan-300 border border-cyan-500/60 uppercase shadow-sm">
                  v1.0.0 • Final
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span>Interactive Periodic Table</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400/90 font-semibold">Design by ZP</span>
              </p>
            </div>
          </div>

          {/* Quick Action buttons for mobile screen header */}
          <div className="sm:hidden flex items-center gap-1.5">
            {!isInstalled && (
              <button
                type="button"
                onClick={onOpenInstallGuide}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                title="Pasang ATOM 3D di Layar Utama"
                aria-label="Install App"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            <button
              onClick={onOpenLearning}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              aria-label="Buka Mode Belajar Kimia"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Belajar</span>
            </button>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Main App Mode Toggle (Tabel Standar vs Sifat Keperiodikan vs Chemistry Lab) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => onToggleActiveMode('standard')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'standard'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tabel Periodik standar berbasis kategori unsur"
            >
              <Atom className="w-3.5 h-3.5" />
              <span>Tabel Standar</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleActiveMode('trends')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'trends'
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualisasi Sifat Keperiodikan Unsur (Jari-jari, Energi Ionisasi, dll)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Sifat Keperiodikan</span>
              <span className="xs:hidden">Tren</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleActiveMode('lab')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'lab'
                  ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 shadow-sm border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Laboratorium Kimia Virtual — Reaksi dan Pengamatan Zat"
            >
              <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
              <span>🧪 Chemistry Lab</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleActiveMode('journey')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'journey'
                  ? 'bg-gradient-to-r from-indigo-500/25 to-cyan-500/25 text-cyan-300 shadow-sm border border-cyan-500/40 ring-1 ring-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Jalur Pembelajaran Interaktif: Memahami, Mengaplikasikan, dan Merefleksikan"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>📚 Journey</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleActiveMode('assessment')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'assessment'
                  ? 'bg-gradient-to-r from-purple-500/25 to-amber-500/25 text-amber-300 shadow-sm border border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Evaluasi dan Tantangan Kimia: Kuis Tematik, Speed 60s, dan Studi Kasus"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>🎯 Challenge</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleActiveMode('progress')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'progress'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-cyan-300 shadow-sm border border-cyan-500/40 ring-1 ring-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Progress Belajar — Analisis & Bukti Pembelajaran Kimia"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>📊 Progress Belajar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle (Grid vs List) - only relevant for periodic table */}
            {(activeMode === 'standard' || activeMode === 'trends') && (
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => onToggleViewMode('grid')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tampilan Tabel Periodik Modern"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleViewMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tampilan Kartu Ringkas (Mudah di Smartphone)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Kartu</span>
                </button>
              </div>
            )}

            {/* Belajar button for desktop */}
            <button
              onClick={onOpenLearning}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/10 active:scale-95 transition-all border border-cyan-400/20 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 Belajar</span>
            </button>

            {/* Install PWA Button for desktop / tablet */}
            {!isInstalled && (
              <button
                type="button"
                onClick={onOpenInstallGuide}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-md shadow-cyan-950/40 active:scale-95 transition-all cursor-pointer"
                title="Pasang ATOM 3D di Layar Utama"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>📱 Install</span>
              </button>
            )}

            {/* About / Info Button */}
            <button
              type="button"
              onClick={onOpenAbout}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
              title="Tentang ATOM 3D & Bagikan Aplikasi"
              aria-label="Tentang ATOM 3D"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">Tentang</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
