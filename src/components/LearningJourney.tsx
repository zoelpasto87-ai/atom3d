import React, { useState, useEffect } from 'react';
import {
  LEARNING_JOURNEY_DATA,
  JourneySection,
} from '../data/learning-journey-data';
import {
  LearningJourneyProgress,
  loadLearningJourneyProgress,
  saveLearningJourneyProgress,
  clearLearningJourneyProgress,
  calculateJourneySummary,
} from '../utils/learning-journey-storage';
import { ChemicalElement } from '../types/element';
import { ELEMENTS, getElementByNumber } from '../data/elements';
import { CATEGORIES } from '../utils/categories';
import { formatAtomicMass } from '../utils/chemistry';
import {
  Compass,
  CheckCircle2,
  Circle,
  Brain,
  FlaskConical,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Atom,
  RotateCcw,
  Save,
  Trash2,
  ExternalLink,
  Check,
  TrendingUp,
  Scale,
  Camera,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface LearningJourneyProps {
  onNavigateToPeriodicTable: (highlightElement?: ChemicalElement) => void;
  onNavigateToAtom3D: (element: ChemicalElement) => void;
  onNavigateToTrends: () => void;
  onNavigateToCompare3: () => void;
  onNavigateToLab: () => void;
  onNavigateToAR: (element: ChemicalElement) => void;
  onCloseJourney?: () => void;
  selectedElement: ChemicalElement;
  onSelectElement: (element: ChemicalElement) => void;
}

export const LearningJourney: React.FC<LearningJourneyProps> = ({
  onNavigateToPeriodicTable,
  onNavigateToAtom3D,
  onNavigateToTrends,
  onNavigateToCompare3,
  onNavigateToLab,
  onNavigateToAR,
  onCloseJourney,
  selectedElement,
  onSelectElement,
}) => {
  // Load saved progress from localStorage
  const [progress, setProgress] = useState<LearningJourneyProgress>(() =>
    loadLearningJourneyProgress()
  );

  // Active section inside Learning Journey
  const [activeSection, setActiveSection] = useState<JourneySection>('memahami');

  // Reflection form input state
  const [reflections, setReflections] = useState<Record<string, string>>(() => {
    return progress.reflectionAnswers || {};
  });

  // Local state for interactive choices in Section 2 (Tantangan)
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, number>>(() => {
    return progress.applicationAnswers || {};
  });

  // Predictions in challenge 5
  const [predictionAnswers, setPredictionAnswers] = useState<Record<string, number>>(() => {
    return progress.applicationPredictions || {};
  });

  // Toast / alert for feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Activity 1 element selection local state
  const [und1ElementNumber, setUnd1ElementNumber] = useState<number>(() => {
    return progress.selectedElementNumber || selectedElement.atomicNumber;
  });

  // Save progress helper
  const updateProgress = (updater: (prev: LearningJourneyProgress) => LearningJourneyProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveLearningJourneyProgress(next);
      return next;
    });
  };

  const summary = calculateJourneySummary(progress);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Section 1 - Activity completion toggle
  const toggleUnderstandingActivity = (activityId: string) => {
    updateProgress((prev) => {
      const isDone = prev.understandingCompleted.includes(activityId);
      const updated = isDone
        ? prev.understandingCompleted.filter((id) => id !== activityId)
        : [...prev.understandingCompleted, activityId];
      return {
        ...prev,
        understandingCompleted: updated,
      };
    });
  };

  // Section 1 - Checklist toggle for und-2
  const toggleChecklistItem = (itemKey: string) => {
    updateProgress((prev) => {
      const current = prev.understandingChecklist[itemKey] || false;
      const nextChecklist = {
        ...prev.understandingChecklist,
        [itemKey]: !current,
      };

      // If all 3 items checked, mark und-2 as completed automatically
      const items = ['core', 'shells', 'valence'];
      const allDone = items.every((k) =>
        k === itemKey ? !current : nextChecklist[k]
      );
      let updatedCompleted = [...prev.understandingCompleted];
      if (allDone && !updatedCompleted.includes('und-2')) {
        updatedCompleted.push('und-2');
      }

      return {
        ...prev,
        understandingChecklist: nextChecklist,
        understandingCompleted: updatedCompleted,
      };
    });
  };

  // Section 2 - Handle challenge answer selection
  const handleSelectChallengeAnswer = (challengeId: string, optionIndex: number, isCorrect: boolean) => {
    setChallengeAnswers((prev) => ({ ...prev, [challengeId]: optionIndex }));
    updateProgress((prev) => {
      const nextAnswers = {
        ...prev.applicationAnswers,
        [challengeId]: optionIndex,
      };
      let nextCompleted = [...prev.applicationCompleted];
      if (isCorrect && !nextCompleted.includes(challengeId)) {
        nextCompleted.push(challengeId);
      }
      return {
        ...prev,
        applicationAnswers: nextAnswers,
        applicationCompleted: nextCompleted,
      };
    });
  };

  // Section 3 - Save reflections
  const handleSaveReflections = () => {
    updateProgress((prev) => ({
      ...prev,
      reflectionAnswers: reflections,
    }));
    showToast('✓ Jawaban refleksi berhasil disimpan ke penyimpanan lokal.');
  };

  // Section 3 - Clear reflections
  const handleClearReflections = () => {
    if (window.confirm('Hapus seluruh jawaban refleksi yang telah ditulis?')) {
      setReflections({});
      updateProgress((prev) => ({
        ...prev,
        reflectionAnswers: {},
      }));
      showToast('Jawaban refleksi telah dikosongkan.');
    }
  };

  // Reset entire journey
  const handleResetEntireJourney = () => {
    if (window.confirm('Reset seluruh progres perjalanan belajar kembali ke 0%?')) {
      const fresh = clearLearningJourneyProgress();
      setProgress(fresh);
      setChallengeAnswers({});
      setPredictionAnswers({});
      setReflections({});
      showToast('Seluruh progres perjalanan belajar telah di-reset.');
    }
  };

  const activeElementObj = getElementByNumber(und1ElementNumber) || selectedElement;
  const activeCatInfo = CATEGORIES[activeElementObj.category];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-cyan-950 border border-cyan-500/80 text-cyan-200 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Learning Journey Header */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>📚 LEARNING JOURNEY</span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
                  Phase 7
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                &quot;{LEARNING_JOURNEY_DATA.subtitle}&quot;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {onCloseJourney && (
              <button
                type="button"
                onClick={onCloseJourney}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tabel Standar</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetEntireJourney}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-800 hover:border-rose-800/60 transition-all cursor-pointer"
              title="Reset seluruh progres"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progres</span>
            </button>
          </div>
        </div>

        {/* Journey Progress Dashboard Card */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-8 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Perjalanan Belajar</span>
              </span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                Progres: {summary.percentage}%
              </span>
            </div>

            {/* Continuous Progress Bar with milestones (0%, 33%, 66%, 100%) */}
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${summary.percentage}%` }}
              />
            </div>

            {/* Section Badges Checklist */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  summary.isUnderstandingComplete
                    ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                {summary.isUnderstandingComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <div className="min-w-0 truncate">
                  <span className="font-bold text-[11px] block truncate">Memahami</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {summary.understandingCount}/{summary.understandingTotal} aktivitas
                  </span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  summary.isApplicationComplete
                    ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                {summary.isApplicationComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <div className="min-w-0 truncate">
                  <span className="font-bold text-[11px] block truncate">Mengaplikasikan</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {summary.applicationCount}/{summary.applicationTotal} tantangan
                  </span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  summary.isReflectionComplete
                    ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                {summary.isReflectionComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <div className="min-w-0 truncate">
                  <span className="font-bold text-[11px] block truncate">Merefleksikan</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {summary.reflectionCount}/{summary.reflectionTotal} refleksi
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-300 block">Pesan Pembelajaran:</span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {summary.percentage === 0 && 'Langkah berikutnya siap dieksplorasi. Mulai dari konsep dasar atom.'}
              {summary.percentage === 33 && 'Bagus sekali! Pengamatanmu adalah bagian penting dari proses belajar. Ayo lanjut ke tantangan aplikasi.'}
              {summary.percentage === 66 && 'Pengamatan dan aplikasimu sangat baik. Lengkapi catatan refleksimu untuk menyempurnakan pemahaman.'}
              {summary.percentage === 100 && '🎉 Seluruh rangkaian perjalanan belajarmu telah tuntas! Kamu dapat meninjau atau mengeksplorasi kembali kapan saja.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3 Main Experience Experience Cards (MEMAHAMI, MENGAPLIKASIKAN, MEREFLEKSIKAN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: MEMAHAMI */}
        <div
          onClick={() => setActiveSection('memahami')}
          className={`relative p-5 rounded-2xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
            activeSection === 'memahami'
              ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-400 shadow-xl ring-2 ring-cyan-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Brain className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  summary.isUnderstandingComplete
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {summary.understandingCount}/4 Selesai
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>🧠 1. MEMAHAMI</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Eksplorasi konsep</p>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Siswa mengamati dan membangun pemahaman konsep melalui eksplorasi tabel dan atom 3D.
            </p>
          </div>
          <button
            type="button"
            className={`mt-4 w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'memahami'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>{summary.isUnderstandingComplete ? 'Buka Kembali' : 'Mulai Eksplorasi'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: MENGAPLIKASIKAN */}
        <div
          onClick={() => setActiveSection('mengaplikasikan')}
          className={`relative p-5 rounded-2xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
            activeSection === 'mengaplikasikan'
              ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-400 shadow-xl ring-2 ring-amber-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <FlaskConical className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  summary.isApplicationComplete
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {summary.applicationCount}/6 Selesai
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>🧪 2. MENGAPLIKASIKAN</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Terapkan pengetahuan</p>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Tantangan interaktif untuk menganalisis sifat keperiodikan, reaksi lab, dan AR.
            </p>
          </div>
          <button
            type="button"
            className={`mt-4 w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'mengaplikasikan'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>{summary.isApplicationComplete ? 'Buka Kembali' : 'Mulai Tantangan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: MEREFLEKSIKAN */}
        <div
          onClick={() => setActiveSection('merefleksikan')}
          className={`relative p-5 rounded-2xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
            activeSection === 'merefleksikan'
              ? 'bg-gradient-to-b from-indigo-950/40 to-slate-900 border-indigo-400 shadow-xl ring-2 ring-indigo-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  summary.isReflectionComplete
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {summary.reflectionCount}/5 Selesai
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>💭 3. MEREFLEKSIKAN</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Renungkan temuanmu</p>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Hubungkan eksplorasi dengan kata-kata sendiri melalui pertanyaan terbuka.
            </p>
          </div>
          <button
            type="button"
            className={`mt-4 w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'merefleksikan'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>{summary.isReflectionComplete ? 'Buka Kembali' : 'Tulis Refleksi'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Completion Celebration Hero Card when 100% */}
      {summary.isAllComplete && (
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-2 border-emerald-500/60 shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-300">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl">
            🎉
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            PERJALANAN BELAJARMU SELESAI
          </h2>
          <div className="flex items-center justify-center gap-3 text-xs font-bold text-emerald-300 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700">
              MEMAHAMI ✓
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700">
              MENGAPLIKASIKAN ✓
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700">
              MEREFLEKSIKAN ✓
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            &quot;Selama perjalanan ini kamu telah mengeksplorasi atom, unsur, sifat keperiodikan, perbandingan unsur, dan reaksi kimia.&quot;
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                showToast('Kamu dapat terus mengeksplorasi seluruh fitur kapan saja.');
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-100 transition-transform cursor-pointer"
            >
              Jelajahi Lagi
            </button>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* SECTION 1: MEMAHAMI CONTENT                                          */}
      {/* ==================================================================== */}
      {activeSection === 'memahami' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                BAGIAN 1: 🧠 MEMAHAMI
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              <strong>Tujuan:</strong> &quot;{LEARNING_JOURNEY_DATA.sections.memahami.goal}&quot;
            </p>
          </div>

          {/* AKTIVITAS 1: KENALI UNSUR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Aktivitas 1
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Kenali Unsur
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Instruksi: &quot;Pilih satu unsur dari tabel periodik.&quot;
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleUnderstandingActivity('und-1')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  progress.understandingCompleted.includes('und-1')
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {progress.understandingCompleted.includes('und-1') ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Selesai</span>
                  </>
                ) : (
                  <span>Tandai Selesai</span>
                )}
              </button>
            </div>

            {/* Element Quick Picker & Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div className="sm:col-span-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                    Ganti Unsur Pengamatan:
                  </span>
                  <select
                    value={und1ElementNumber}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10);
                      setUnd1ElementNumber(num);
                      const el = getElementByNumber(num);
                      if (el) {
                        onSelectElement(el);
                        updateProgress((prev) => ({
                          ...prev,
                          selectedElementNumber: num,
                        }));
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2 font-medium focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                  >
                    {ELEMENTS.map((el) => (
                      <option key={el.atomicNumber} value={el.atomicNumber}>
                        {el.atomicNumber}. {el.symbol} — {el.name} ({el.category})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToPeriodicTable(activeElementObj)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Jelajahi Tabel Periodik</span>
                </button>
              </div>

              {/* Element details display required: nama, simbol, nomor atom, golongan, periode, konfigurasi elektron, elektron valensi */}
              <div className="sm:col-span-8 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-800/80">
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold border shrink-0"
                    style={{
                      borderColor: activeCatInfo.accentColor,
                      backgroundColor: '#020617',
                    }}
                  >
                    <span className="text-[9px] text-slate-400 font-mono">
                      {activeElementObj.atomicNumber}
                    </span>
                    <span className="text-xl font-black text-white leading-none">
                      {activeElementObj.symbol}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>{activeElementObj.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {activeElementObj.category}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Massa Atom: {formatAtomicMass(activeElementObj.atomicMass)} u
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 text-xs font-mono">
                  <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block font-sans">Nomor Atom</span>
                    <span className="font-bold text-white">Z = {activeElementObj.atomicNumber}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block font-sans">Golongan</span>
                    <span className="font-bold text-slate-200">
                      {activeElementObj.group !== null ? `Gol. ${activeElementObj.group}` : 'f-block'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block font-sans">Periode</span>
                    <span className="font-bold text-slate-200">Per. {activeElementObj.period}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block font-sans">Elektron Valensi</span>
                    <span className="font-bold text-amber-300">
                      {activeElementObj.valenceElectrons ?? '—'}
                    </span>
                  </div>
                </div>

                <div className="text-xs p-2 rounded-lg bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono text-cyan-300 text-[11px]">
                    Konfigurasi: {activeElementObj.electronConfiguration}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectElement(activeElementObj);
                      onNavigateToAtom3D(activeElementObj);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shadow-md self-end sm:self-auto cursor-pointer"
                  >
                    <Atom className="w-3.5 h-3.5" />
                    <span>Lihat Atom 3D</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AKTIVITAS 2: AMATI STRUKTUR ATOM */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Aktivitas 2
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Amati Struktur Atom
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Instruksi: &quot;Buka Atom 3D dan amati distribusi elektron.&quot;
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleUnderstandingActivity('und-2')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  progress.understandingCompleted.includes('und-2')
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {progress.understandingCompleted.includes('und-2') ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Selesai</span>
                  </>
                ) : (
                  <span>Tandai Selesai</span>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-300">
                Model 3D interaktif menampilkan proton, neutron, kulit orbital bola, dan rotasi elektron terluar secara real-time.
              </div>
              <button
                type="button"
                onClick={() => onNavigateToAtom3D(activeElementObj)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                <Atom className="w-4 h-4" />
                <span>Buka Atom 3D ({activeElementObj.symbol})</span>
              </button>
            </div>

            {/* Checklist required:
                ☐ Saya mengamati inti atom
                ☐ Saya mengamati kulit elektron
                ☐ Saya mengamati elektron valensi */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Lembar Observasi Mandiri:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { key: 'core', label: 'Saya mengamati inti atom' },
                  { key: 'shells', label: 'Saya mengamati kulit elektron' },
                  { key: 'valence', label: 'Saya mengamati elektron valensi' },
                ].map(({ key, label }) => {
                  const isChecked = Boolean(progress.understandingChecklist[key]);
                  return (
                    <label
                      key={key}
                      onClick={() => toggleChecklistItem(key)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AKTIVITAS 3: AMATI POLA PERIODIK */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Aktivitas 3
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Amati Pola Periodik
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Instruksi: &quot;Pilih sifat keperiodikan dan amati perubahannya pada tabel periodik.&quot;
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleUnderstandingActivity('und-3')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  progress.understandingCompleted.includes('und-3')
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {progress.understandingCompleted.includes('und-3') ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Selesai</span>
                  </>
                ) : (
                  <span>Tandai Selesai</span>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-300">
                Jelajahi gradien kuantitatif 4 sifat periodik: Jari-jari atom, Energi ionisasi pertama, Elektronegativitas Pauling, dan Afinitas elektron.
              </p>
              <button
                type="button"
                onClick={onNavigateToTrends}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Eksplorasi Sifat Keperiodikan</span>
              </button>
            </div>
          </div>

          {/* AKTIVITAS 4: BANDINGKAN 3 UNSUR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Aktivitas 4
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Bandingkan 3 Unsur
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Instruksi: &quot;Pilih tiga unsur dan bandingkan sifatnya.&quot;
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleUnderstandingActivity('und-4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  progress.understandingCompleted.includes('und-4')
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {progress.understandingCompleted.includes('und-4') ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Selesai</span>
                  </>
                ) : (
                  <span>Tandai Selesai</span>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-300">
                Pilih tiga unsur (misalnya Na, Mg, Cl) langsung dari tabel dan pelajari komparasi sifat atomik serta analisis hukum keperiodikan.
              </p>
              <button
                type="button"
                onClick={onNavigateToCompare3}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Bandingkan 3 Unsur</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: MENGAPLIKASIKAN CONTENT                                    */}
      {/* ==================================================================== */}
      {activeSection === 'mengaplikasikan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                BAGIAN 2: 🧪 MENGAPLIKASIKAN
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              <strong>Tujuan:</strong> &quot;{LEARNING_JOURNEY_DATA.sections.mengaplikasikan.goal}&quot;
            </p>
          </div>

          {/* TANTANGAN 1 — TEBAK UNSUR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Tantangan 1
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Tebak Unsur
                </h3>
              </div>
              {progress.applicationCompleted.includes('app-1') && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
            </div>

            {/* Info Snippet */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase font-sans">Nomor Atom</span>
                <span className="font-bold text-white text-sm">17</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase font-sans">Periode</span>
                <span className="font-bold text-slate-200 text-sm">3</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase font-sans">Elektron Valensi</span>
                <span className="font-bold text-amber-300 text-sm">7</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-200">
              Pertanyaan: &quot;Unsur apakah ini?&quot;
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['A. Na', 'B. Mg', 'C. Cl', 'D. Ar'].map((opt, idx) => {
                const isSelected = challengeAnswers['app-1'] === idx;
                const isCorrect = idx === 2; // C. Cl
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectChallengeAnswer('app-1', idx, isCorrect)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback box */}
            {challengeAnswers['app-1'] !== undefined && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  challengeAnswers['app-1'] === 2
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                }`}
              >
                {challengeAnswers['app-1'] === 2
                  ? '✓ Benar. Cl memiliki nomor atom 17.'
                  : '✕ Periksa kembali nomor atom dan posisi unsur pada tabel periodik.'}
              </div>
            )}
          </div>

          {/* TANTANGAN 2 — DISTRIBUSI ELEKTRON */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Tantangan 2
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Distribusi Elektron
                </h3>
              </div>
              {progress.applicationCompleted.includes('app-2') && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-200">
              Pertanyaan: &quot;Suatu atom memiliki distribusi elektron 2,8,1. Unsur apakah yang paling sesuai?&quot;
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['A. Na', 'B. Mg', 'C. Al', 'D. K'].map((opt, idx) => {
                const isSelected = challengeAnswers['app-2'] === idx;
                const isCorrect = idx === 0; // A. Na
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectChallengeAnswer('app-2', idx, isCorrect)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {challengeAnswers['app-2'] !== undefined && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  challengeAnswers['app-2'] === 0
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                }`}
              >
                {challengeAnswers['app-2'] === 0
                  ? '✓ Benar. Natrium (Na) memiliki nomor atom 11 dengan susunan kulit 2,8,1 dan memiliki 1 elektron valensi.'
                  : '✕ Total elektron = 2 + 8 + 1 = 11. Periksa nomor atom unsur dengan 11 elektron netral.'}
              </div>
            )}
          </div>

          {/* TANTANGAN 3 — SIFAT KEPERIODIKAN */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Tantangan 3
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Sifat Keperiodikan
                </h3>
              </div>
              {progress.applicationCompleted.includes('app-3') && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
            </div>

            {/* Display Na, Mg, Cl */}
            <div className="flex items-center gap-2 justify-center py-2 font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-300 font-bold">
                11 Na
              </span>
              <span className="text-slate-500">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-bold">
                12 Mg
              </span>
              <span className="text-slate-500">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/50 text-emerald-300 font-bold">
                17 Cl
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-200">
              Pertanyaan: &quot;Bagaimana kecenderungan energi ionisasi dari Na menuju Cl dalam satu periode?&quot;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'A. Cenderung meningkat',
                'B. Cenderung menurun',
                'C. Tidak memiliki pola sama sekali',
                'D. Selalu tetap',
              ].map((opt, idx) => {
                const isSelected = challengeAnswers['app-3'] === idx;
                const isCorrect = idx === 0;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectChallengeAnswer('app-3', idx, isCorrect)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {challengeAnswers['app-3'] !== undefined && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  challengeAnswers['app-3'] === 0
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                }`}
              >
                {challengeAnswers['app-3'] === 0
                  ? '✓ Tepat! Secara umum energi ionisasi cenderung meningkat dari kiri ke kanan dalam satu periode, dengan adanya pengecualian tertentu akibat konfigurasi subkulit penuh atau setengah penuh.'
                  : '✕ Kurang tepat. Dari kiri ke kanan, muatan inti efektif meningkat dan jari-jari mengecil, sehingga elektron terluar semakin sulit dilepaskan.'}
              </div>
            )}
          </div>

          {/* TANTANGAN 4 — BANDINGKAN 3 UNSUR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Tantangan 4
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Bandingkan 3 Unsur
                </h3>
              </div>
              {progress.applicationCompleted.includes('app-4') && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white block">Tugas Pengamatan:</span>
                &quot;Pilih tiga unsur dari satu periode. Amati jari-jari atom dan energi ionisasi.&quot;
              </div>
              <button
                type="button"
                onClick={onNavigateToCompare3}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Buka Bandingkan 3 Unsur</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-200">
              Pertanyaan: &quot;Apa pola yang kamu temukan?&quot;
            </p>

            <div className="space-y-2">
              {[
                'A. Jari-jari atom mengecil dan energi ionisasi cenderung meningkat dari kiri ke kanan',
                'B. Jari-jari atom membesar dan energi ionisasi cenderung menurun dari kiri ke kanan',
                'C. Jari-jari atom dan energi ionisasi sama-sama membesar tanpa batas',
                'D. Tidak ada keteraturan pola antara jari-jari dan energi ionisasi',
              ].map((opt, idx) => {
                const isSelected = challengeAnswers['app-4'] === idx;
                const isCorrect = idx === 0;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectChallengeAnswer('app-4', idx, isCorrect)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {challengeAnswers['app-4'] !== undefined && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  challengeAnswers['app-4'] === 0
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                }`}
              >
                {challengeAnswers['app-4'] === 0
                  ? '✓ Luar biasa! Jari-jari yang mengecil menempatkan elektron lebih dekat dengan inti, sehingga energi yang diperlukan untuk melepaskan elektron semakin besar.'
                  : '✕ Perhatikan kembali tabel komparasi: Na memiliki jari-jari 2.27 Å (EI: 495.8) sedangkan Cl memiliki jari-jari 1.75 Å (EI: 1251.2).'}
              </div>
            )}
          </div>

          {/* TANTANGAN 5 — CHEMISTRY LAB */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Tantangan 5
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Chemistry Lab — Eksperimen Reaksi
                </h3>
              </div>
              {progress.applicationCompleted.includes('app-5') && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white block">Tugas Lab:</span>
                &quot;Pilih eksperimen Cuka + Soda Kue.&quot;
              </div>
              <button
                type="button"
                onClick={onNavigateToLab}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Buka Chemistry Lab</span>
              </button>
            </div>

            {/* Prediction */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 block">
                Sebelum simulasi: &quot;Prediksikan apa yang akan terjadi?&quot;
              </span>
              <div className="space-y-1.5">
                {[
                  'Terjadi letupan buih gas dan sedikit penurunan suhu',
                  'Larutan berubah warna menjadi biru pekat tanpa buih',
                  'Terbentuk endapan logam padat yang mengapung',
                ].map((pred, pIdx) => {
                  const isChosen = predictionAnswers['pred-5'] === pIdx;
                  return (
                    <button
                      key={pred}
                      type="button"
                      onClick={() => {
                        setPredictionAnswers((prev) => ({ ...prev, 'pred-5': pIdx }));
                        updateProgress((prev) => ({
                          ...prev,
                          applicationPredictions: {
                            ...prev.applicationPredictions,
                            'pred-5': pIdx,
                          },
                        }));
                      }}
                      className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        isChosen
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isChosen ? '✓ Prediksimu: ' : '○ '} {pred}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-200">
              Setelah simulasi: &quot;Gas apa yang terbentuk?&quot;
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                'A. Karbon dioksida (CO₂)',
                'B. Oksigen (O₂)',
                'C. Hidrogen (H₂)',
                'D. Gas Klorin (Cl₂)',
              ].map((opt, idx) => {
                const isSelected = challengeAnswers['app-5'] === idx;
                const isCorrect = idx === 0;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectChallengeAnswer('app-5', idx, isCorrect)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {challengeAnswers['app-5'] !== undefined && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  challengeAnswers['app-5'] === 0
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                }`}
              >
                {challengeAnswers['app-5'] === 0
                  ? '✓ Tepat sekali! Reaksi CH₃COOH + NaHCO₃ menghasilkan gas Karbon dioksida (CO₂) yang menyebabkan efek berbuih pada wadah lab.'
                  : '✕ Periksa kembali hasil pengamatan di Chemistry Lab: gas yang muncul dari pemecahan bikarbonat adalah CO₂.'}
              </div>
            )}
          </div>

          {/* TANTANGAN 6 — ATOM AR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Tantangan 6
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Atom AR — Model Spasial di Dunia Nyata
                </h3>
              </div>
              {progress.applicationCompleted.includes('app-6') && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">
                Tugas: &quot;Tempatkan atom pada permukaan di sekitar kamu.&quot;
              </span>
              <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside pl-1">
                <li>Pilih unsur (misalnya Oksigen atau Kalsium)</li>
                <li>Buka AR (atau Atom 3D jika AR tidak didukung perangkat)</li>
                <li>Tempatkan atom pada permukaan datar</li>
                <li>Amati struktur atom dari berbagai sudut</li>
                <li>Putar atom dan cermati posisi elektron</li>
                <li>Amati elektron valensi di kulit terluar</li>
              </ol>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onNavigateToAR(activeElementObj)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>🥽 Buka Atom AR ({activeElementObj.symbol})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToAtom3D(activeElementObj)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span>Buka Atom 3D (Alternatif / Fallback)</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-200">
              Pertanyaan: &quot;Setelah mengamati atom di ruang 3D / AR, di manakah letak elektron valensi?&quot;
            </p>

            <div className="space-y-2">
              {[
                'A. Berada pada lintasan kulit terluar dan menentukan sifat kimia atom',
                'B. Selalu menempel di pusat inti atom bersama proton',
                'C. Elektron valensi tidak memiliki orbit dan tidak dapat diamati',
              ].map((opt, idx) => {
                const isSelected = challengeAnswers['app-6'] === idx;
                const isCorrect = idx === 0;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectChallengeAnswer('app-6', idx, isCorrect)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {challengeAnswers['app-6'] !== undefined && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  challengeAnswers['app-6'] === 0
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                }`}
              >
                {challengeAnswers['app-6'] === 0
                  ? '✓ Sempurna! Elektron valensi berada di lintasan kulit terluar dan menjadi aktor utama dalam pembentukan ikatan kimia.'
                  : '✕ Perhatikan kembali model atom 3D / AR: kulit terluar adalah posisi elektron valensi mengorbit.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: MEREFLEKSIKAN CONTENT                                     */}
      {/* ==================================================================== */}
      {activeSection === 'merefleksikan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  BAGIAN 3: 💭 MEREFLEKSIKAN
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Tujuan:</strong> &quot;{LEARNING_JOURNEY_DATA.sections.merefleksikan.goal}&quot;
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveReflections}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-100 transition-transform cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Refleksi</span>
              </button>
              <button
                type="button"
                onClick={handleClearReflections}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-750 transition-colors cursor-pointer"
                title="Hapus Jawaban"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 px-1">
            💡 Tuliskan pemikiran dan temuanmu secara bebas. Jawaban disimpan di perangkatmu via <code>localStorage</code> dan tetap tersimpan saat kamu kembali.
          </div>

          {/* 5 Reflection Questions with Text Areas */}
          {LEARNING_JOURNEY_DATA.sections.merefleksikan.questions.map((q) => {
            const val = reflections[q.id] || '';
            const isFilled = val.trim().length > 3;

            return (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                      Refleksi {q.number}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      &quot;{q.question}&quot;
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isFilled
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isFilled ? '✓ Terisi' : 'Belum diisi'}
                  </span>
                </div>

                {q.guidanceNote && (
                  <p className="text-[11px] text-slate-400 italic">
                    Petunjuk: {q.guidanceNote}
                  </p>
                )}

                <textarea
                  rows={3}
                  value={val}
                  onChange={(e) => {
                    const text = e.target.value;
                    setReflections((prev) => ({ ...prev, [q.id]: text }));
                    updateProgress((prev) => ({
                      ...prev,
                      reflectionAnswers: {
                        ...prev.reflectionAnswers,
                        [q.id]: text,
                      },
                    }));
                  }}
                  placeholder={q.placeholder}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-200 text-xs sm:text-sm rounded-xl p-3 leading-relaxed focus:outline-none transition-all resize-y min-h-[80px]"
                />
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveReflections}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-100 transition-transform cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Refleksi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
