import React, { useState, useEffect, useCallback } from 'react';
import {
  Material,
  MATERIALS,
  Experiment,
  EXPERIMENTS,
  findExperiment,
  getMaterialById,
} from '../data/chemistry-lab-data';
import { BeakerVisualizer } from './BeakerVisualizer';
import { ParticleModal } from './ParticleModal';
import { ObservationSheetModal } from './ObservationSheetModal';
import { ChemicalElement } from '../types/element';
import { getElementByNumber } from '../data/elements';
import { trackLabExperiment } from '../utils/learning-progress-storage';
import {
  FlaskConical,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRight,
  Eye,
  Info,
  HelpCircle,
  ShieldAlert,
  Play,
  Atom,
} from 'lucide-react';

interface ChemistryLabProps {
  onSelectElement: (element: ChemicalElement) => void;
  onNavigateToPeriodicTable: () => void;
  onOpenAtom3D?: (element: ChemicalElement) => void;
}

export const ChemistryLab: React.FC<ChemistryLabProps> = ({
  onSelectElement,
  onNavigateToPeriodicTable,
  onOpenAtom3D,
}) => {
  // Material selections
  const [materialAId, setMaterialAId] = useState<string>('cuka');
  const [materialBId, setMaterialBId] = useState<string>('soda_kue');

  // Prediction state
  const [selectedPrediction, setSelectedPrediction] = useState<string>('');

  // Simulation execution state
  const [reactionState, setReactionState] = useState<
    'idle' | 'pouring' | 'mixing' | 'reacting' | 'completed'
  >('idle');
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [isUnsupportedCombination, setIsUnsupportedCombination] = useState<boolean>(false);

  // Modals
  const [isParticleModalOpen, setIsParticleModalOpen] = useState<boolean>(false);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState<boolean>(false);

  // Guided checklist state
  const [checklist, setChecklist] = useState<{
    picked: boolean;
    predicted: boolean;
    mixed: boolean;
    observed: boolean;
    concluded: boolean;
  }>({
    picked: true,
    predicted: false,
    mixed: false,
    observed: false,
    concluded: false,
  });

  const materialA = getMaterialById(materialAId) || null;
  const materialB = getMaterialById(materialBId) || null;

  // Handle Quick Presets
  const handleSelectPreset = (idA: string, idB: string) => {
    setReactionState('idle');
    setActiveExperiment(null);
    setIsUnsupportedCombination(false);
    setMaterialAId(idA);
    setMaterialBId(idB);
    setSelectedPrediction('');
    setChecklist((prev) => ({
      ...prev,
      picked: true,
      mixed: false,
      observed: false,
    }));
  };

  // Run the Mixing Animation Sequence
  const handleMix = () => {
    if (!materialA || !materialB) return;

    const matchedExp = findExperiment(materialA.id, materialB.id);

    if (!matchedExp) {
      setIsUnsupportedCombination(true);
      setActiveExperiment(null);
      setReactionState('idle');
      return;
    }

    setIsUnsupportedCombination(false);
    setActiveExperiment(matchedExp);
    setChecklist((prev) => ({
      ...prev,
      predicted: Boolean(selectedPrediction),
      mixed: true,
    }));

    // Stage 1: Pouring materials into beaker
    setReactionState('pouring');

    setTimeout(() => {
      // Stage 2: Mixing
      setReactionState('mixing');

      setTimeout(() => {
        // Stage 3: Reacting (bubbles, dissolution, etc.)
        setReactionState('reacting');

        setTimeout(() => {
          // Stage 4: Completed
          setReactionState('completed');
          setChecklist((prev) => ({ ...prev, observed: true }));
          trackLabExperiment(matchedExp.id, matchedExp.title, matchedExp.materials);
        }, 3200);
      }, 1000);
    }, 900);
  };

  // Reset experiment
  const handleReset = () => {
    setReactionState('idle');
    setActiveExperiment(null);
    setIsUnsupportedCombination(false);
    setSelectedPrediction('');
  };

  // Elements involved in current reaction or materials
  const involvedElementNumbers = activeExperiment
    ? activeExperiment.primaryElements
    : [
        ...(materialA ? materialA.containedElements : []),
        ...(materialB ? materialB.containedElements : []),
      ].filter((val, idx, self) => self.indexOf(val) === idx);

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-teal-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <FlaskConical className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                Chemistry Lab
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                Phase 6
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Laboratorium Kimia Virtual — Pilih bahan, uji reaksi, dan amati perubahan zat secara interaktif
            </p>
          </div>
        </div>

        {/* Action Buttons: Digital Observation Notebook */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <button
            type="button"
            onClick={() => setIsObservationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold border border-cyan-500/30 shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Lembar Pengamatan</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
            title="Kosongkan wadah dan reset eksperimen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </section>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (lg:col-span-5): Area Eksperimen (Interactive Beaker & Controls) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>Area Eksperimen</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Wadah: Gelas Beaker 250 mL
              </span>
            </div>

            {/* Interactive Animated Glass Beaker */}
            <BeakerVisualizer
              materialA={materialA}
              materialB={materialB}
              visualEffect={activeExperiment ? activeExperiment.visualEffect : 'none'}
              reactionState={reactionState}
            />

            {/* Current Materials in Beaker Tag */}
            <div className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Zat di dalam Gelas:
              </span>
              <div className="flex items-center justify-center gap-2 font-mono text-white font-semibold">
                <span className="text-cyan-300">{materialA?.name || 'Kosong'}</span>
                <span className="text-slate-500">+</span>
                <span className="text-amber-300">{materialB?.name || 'Kosong'}</span>
              </div>
            </div>

            {/* Unsupported combination alert */}
            {isUnsupportedCombination && (
              <div className="w-full p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs leading-relaxed animate-in fade-in flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-300">
                    Eksperimen belum tersedia dalam laboratorium.
                  </strong>
                  <span>
                    Kombinasi bahan ini tidak memiliki data reaksi yang terverifikasi. Silakan
                    coba kombinasi rekomendasi seperti <em>Cuka + Soda Kue</em>, <em>Air + Garam</em>, atau <em>Air Jeruk + Soda Kue</em>.
                  </span>
                </div>
              </div>
            )}

            {/* Action Button: CAMPURKAN */}
            <div className="w-full pt-1">
              <button
                type="button"
                onClick={handleMix}
                disabled={
                  !materialA ||
                  !materialB ||
                  reactionState === 'pouring' ||
                  reactionState === 'mixing' ||
                  reactionState === 'reacting'
                }
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>+ CAMPURKAN BAHAN</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Experiments */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Eksperimen Cepat (Pilih Preset):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectPreset('cuka', 'soda_kue')}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  materialAId === 'cuka' && materialBId === 'soda_kue'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <strong className="block text-white">1. Cuka + Soda Kue</strong>
                <span className="text-[10px] text-slate-400">Pembentukan Gas CO₂</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('air', 'garam')}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  materialAId === 'air' && materialBId === 'garam'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <strong className="block text-white">2. Air + Garam</strong>
                <span className="text-[10px] text-slate-400">Disosiasi Ionik NaCl</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('air', 'gula')}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  materialAId === 'air' && materialBId === 'gula'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <strong className="block text-white">3. Air + Gula</strong>
                <span className="text-[10px] text-slate-400">Pelarutan Molekuler</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('air_jeruk', 'soda_kue')}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  materialAId === 'air_jeruk' && materialBId === 'soda_kue'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <strong className="block text-white">4. Air Jeruk + Soda Kue</strong>
                <span className="text-[10px] text-slate-400">Reaksi Asam Sitrat</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Column (lg:col-span-7): Bahan Selector, Prediksi, Hasil Pengamatan & Edukasi */}
        <section className="lg:col-span-7 space-y-4">
          {/* Material Selectors (Bahan A & Bahan B) */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pilih Bahan Reaksi:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Bahan A Selector */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-cyan-300 uppercase block">
                  Bahan A:
                </span>
                <select
                  value={materialAId}
                  onChange={(e) => {
                    setMaterialAId(e.target.value);
                    setReactionState('idle');
                    setActiveExperiment(null);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {MATERIALS.map((m) => (
                    <option key={`mat-a-${m.id}`} value={m.id}>
                      {m.name} ({m.chemicalFormula})
                    </option>
                  ))}
                </select>

                {materialA && (
                  <div className="text-[11px] text-slate-400 pt-1 space-y-0.5">
                    <p className="line-clamp-2">{materialA.description}</p>
                    <span className="text-cyan-400/90 font-mono block">
                      Wujud: {materialA.matterState} • Rumus: {materialA.chemicalFormula}
                    </span>
                  </div>
                )}
              </div>

              {/* Bahan B Selector */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase block">
                  Bahan B:
                </span>
                <select
                  value={materialBId}
                  onChange={(e) => {
                    setMaterialBId(e.target.value);
                    setReactionState('idle');
                    setActiveExperiment(null);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {MATERIALS.map((m) => (
                    <option key={`mat-b-${m.id}`} value={m.id}>
                      {m.name} ({m.chemicalFormula})
                    </option>
                  ))}
                </select>

                {materialB && (
                  <div className="text-[11px] text-slate-400 pt-1 space-y-0.5">
                    <p className="line-clamp-2">{materialB.description}</p>
                    <span className="text-amber-400/90 font-mono block">
                      Wujud: {materialB.matterState} • Rumus: {materialB.chemicalFormula}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Prediction Feature (Requirement 24) */}
            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  🎯 Menurutmu, apa yang akan terjadi?
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Prediksi Siswa
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                {[
                  'Tidak terjadi perubahan',
                  'Terbentuk gas',
                  'Bahan larut',
                  'Terbentuk endapan',
                  'Perubahan warna',
                ].map((pred) => (
                  <button
                    key={pred}
                    type="button"
                    onClick={() => setSelectedPrediction(pred)}
                    className={`py-1.5 px-2.5 rounded-xl border text-left text-[11px] font-medium transition-all cursor-pointer ${
                      selectedPrediction === pred
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    ○ {pred}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Panel: After reaction completed */}
          {activeExperiment && reactionState === 'completed' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl space-y-4 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Hasil Pengamatan: {activeExperiment.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsParticleModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md hover:bg-cyan-400 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🔬 Lihat Partikel</span>
                </button>
              </div>

              {/* Prediction Comparison */}
              {selectedPrediction && (
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Prediksimu:
                    </span>
                    <strong className="text-white">{selectedPrediction}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Kenyataan Eksperimen:
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        selectedPrediction === activeExperiment.predictionOutcome
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {activeExperiment.predictionOutcome}
                      {selectedPrediction === activeExperiment.predictionOutcome
                        ? ' (Tepat! ✓)'
                        : ' (Bandingkan hasilnya)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Observed Changes */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-300 block uppercase text-[11px]">
                  Perubahan yang Diamati:
                </span>
                <ul className="space-y-1">
                  {activeExperiment.observations.map((obs, idx) => (
                    <li
                      key={`obs-${idx}`}
                      className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-200 flex items-start gap-2"
                    >
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chemical Equation */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  Persamaan Reaksi Kimia Setara:
                </span>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono font-bold text-xs sm:text-sm text-cyan-300 text-center overflow-x-auto">
                  {activeExperiment.chemicalEquation}
                </div>
                <p className="text-[11px] text-slate-400 text-center font-medium italic">
                  {activeExperiment.wordEquation}
                </p>
              </div>

              {/* Apa yang Terjadi? */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <strong className="text-teal-300 font-bold block text-sm">
                  💡 Apa yang Terjadi?
                </strong>
                <p>{activeExperiment.whatHappened}</p>
              </div>

              {/* Jelajahi Unsurnya (Integration to Atom 3D & Periodic Table) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Atom className="w-4 h-4 text-cyan-400" />
                    <span>Jelajahi Unsur Terlibat di Atom 3D</span>
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToPeriodicTable}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Tabel Periodik</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {involvedElementNumbers.map((z) => {
                    const el = getElementByNumber(z);
                    if (!el) return null;
                    return (
                      <button
                        key={`elem-link-${z}`}
                        type="button"
                        onClick={() => {
                          onSelectElement(el);
                          if (onOpenAtom3D) onOpenAtom3D(el);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500 text-white font-mono text-xs transition-all cursor-pointer shadow-sm"
                        title={`Buka Atom 3D ${el.name}`}
                      >
                        <span className="text-cyan-400 font-bold">{el.symbol}</span>
                        <span className="text-slate-300 text-[11px]">{el.name}</span>
                        <span className="text-[10px] text-slate-500">Z={z}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Guided Checklist (Requirement 18) */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              🧑‍🔬 Langkah Eksperimen Terbimbing:
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  checklist.picked
                    ? 'bg-cyan-950/30 border-cyan-800 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <span className="font-bold">✓</span>
                <span>1. Pilih Bahan A dan Bahan B di menu laboratorium.</span>
              </div>
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  checklist.predicted
                    ? 'bg-cyan-950/30 border-cyan-800 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <span className="font-bold">{checklist.predicted ? '✓' : '○'}</span>
                <span>2. Pilih prediksi hasil sebelum mencampurkan bahan.</span>
              </div>
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  checklist.mixed
                    ? 'bg-cyan-950/30 border-cyan-800 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <span className="font-bold">{checklist.mixed ? '✓' : '○'}</span>
                <span>3. Tekan tombol &quot;+ CAMPURKAN&quot; dan amati wadah reaksi.</span>
              </div>
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  checklist.observed
                    ? 'bg-cyan-950/30 border-cyan-800 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <span className="font-bold">{checklist.observed ? '✓' : '○'}</span>
                <span>4. Baca persamaan reaksi kimia dan amati pergerakan partikel mikroskopis.</span>
              </div>
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  checklist.concluded
                    ? 'bg-cyan-950/30 border-cyan-800 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <span className="font-bold">{checklist.concluded ? '✓' : '○'}</span>
                <span>5. Buka Lembar Pengamatan untuk mencatat kesimpulan ilmiah.</span>
              </div>
            </div>
          </div>

          {/* Deep Learning Prompts (Requirement 23) */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              📚 Pembelajaran Mendalam (Deep Learning):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-1">
                <strong className="text-cyan-300 block">MEMAHAMI</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Amati perbedaan antara perubahan kimia (terbentuk zat baru seperti gas CO₂) dan perubahan fisika (pelarutan garam/gula).
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1">
                <strong className="text-amber-300 block">MENGAPLIKASIKAN</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Gunakan pengetahuan reaksi asam-basa untuk memprediksi zat apa yang akan terbentuk sebelum tombol campurkan ditekan.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 space-y-1">
                <strong className="text-indigo-300 block">MEREFLEKSIKAN</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Apa bukti makroskopik yang paling jelas bahwa suatu reaksi kimia telah terjadi di dalam wadah?
                </p>
              </div>
            </div>
          </div>

          {/* Safety Notice (Requirement 17) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block font-bold uppercase text-[11px]">
                ⚠ Keselamatan Laboratorium Kimia
              </strong>
              <span>
                Simulasi ini merupakan media pembelajaran digital. Jangan mencoba eksperimen nyata
                tanpa bimbingan guru dan prosedur keselamatan laboratorium resmi (kacamata pelindung, sarung tangan, jas lab).
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Particle Conceptual Modal */}
      {isParticleModalOpen && activeExperiment && (
        <ParticleModal
          experiment={activeExperiment}
          onClose={() => setIsParticleModalOpen(false)}
        />
      )}

      {/* Observation Sheet Modal */}
      <ObservationSheetModal
        currentMaterials={
          activeExperiment
            ? activeExperiment.title
            : materialA && materialB
            ? `${materialA.name} + ${materialB.name}`
            : ''
        }
        currentObservations={
          activeExperiment ? activeExperiment.observations.join(', ') : ''
        }
        isOpen={isObservationModalOpen}
        onClose={() => {
          setIsObservationModalOpen(false);
          setChecklist((prev) => ({ ...prev, concluded: true }));
        }}
      />
    </div>
  );
};
