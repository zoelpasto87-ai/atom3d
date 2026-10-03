import React, { useState, useEffect, useRef } from 'react';
import {
  LearningProgressData,
  loadLearningProgress,
  saveLearningProgress,
  resetLearningProgress,
  validateImportedProgress,
  LearningActivityItem,
} from '../utils/learning-progress-storage';
import { ChemicalElement } from '../types/element';
import { getElementBySymbol, getElementByNumber } from '../data/elements';
import { EXPERIMENTS } from '../data/chemistry-lab-data';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Printer,
  Sparkles,
  Atom,
  Flame,
  Scale,
  TrendingUp,
  FlaskConical,
  Compass,
  Target,
  FileText,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Shield,
  HelpCircle,
  Eye,
  Camera,
  Check,
  X,
} from 'lucide-react';

interface LearningProgressDashboardProps {
  onNavigateToPeriodicTable: (element?: ChemicalElement) => void;
  onNavigateToAtom3D: (element: ChemicalElement) => void;
  onNavigateToTrends: () => void;
  onNavigateToCompare3: () => void;
  onNavigateToLab: () => void;
  onNavigateToJourney: () => void;
  onNavigateToAssessment: () => void;
  onNavigateToAR: (element: ChemicalElement) => void;
  onClose?: () => void;
  selectedElement: ChemicalElement;
}

export const LearningProgressDashboard: React.FC<LearningProgressDashboardProps> = ({
  onNavigateToPeriodicTable,
  onNavigateToAtom3D,
  onNavigateToTrends,
  onNavigateToCompare3,
  onNavigateToLab,
  onNavigateToJourney,
  onNavigateToAssessment,
  onNavigateToAR,
  onClose,
  selectedElement,
}) => {
  const [data, setData] = useState<LearningProgressData>(() => loadLearningProgress());
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync data on mount or when window regains focus
  useEffect(() => {
    setData(loadLearningProgress());
    const onFocus = () => setData(loadLearningProgress());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Canonical 4 periodic trends
  const CANONICAL_TRENDS = [
    { key: 'atomicRadius', label: 'Jari-jari Atom', unit: 'Å' },
    { key: 'ionizationEnergy', label: 'Energi Ionisasi', unit: 'kJ/mol' },
    { key: 'electronegativity', label: 'Elektronegativitas', unit: 'Pauling' },
    { key: 'electronAffinity', label: 'Afinitas Elektron', unit: 'kJ/mol' },
  ];

  // Canonical 4 lab experiments
  const CANONICAL_EXPERIMENTS = EXPERIMENTS;

  // 16 Core Milestones for accurate "Aktivitas selesai: X / 16"
  const milestones = [
    { id: 'm-1', label: 'Eksplorasi Unsur Pertama', done: data.exploredElements.length >= 1 },
    { id: 'm-2', label: 'Eksplorasi Minimal 5 Unsur', done: data.exploredElements.length >= 5 },
    { id: 'm-3', label: 'Amati Struktur Atom 3D', done: data.atom3dElements.length >= 1 },
    { id: 'm-4', label: 'Amati Minimal 3 Unsur di Atom 3D', done: data.atom3dElements.length >= 3 },
    { id: 'm-5', label: 'Coba Eksplorasi AR', done: data.arSessions.length >= 1 },
    { id: 'm-6', label: 'Eksplorasi Sifat Jari-jari Atom', done: data.trendsExplored.includes('atomicRadius') },
    { id: 'm-7', label: 'Eksplorasi Sifat Energi Ionisasi', done: data.trendsExplored.includes('ionizationEnergy') },
    {
      id: 'm-8',
      label: 'Eksplorasi Elektronegativitas / Afinitas',
      done: data.trendsExplored.includes('electronegativity') || data.trendsExplored.includes('electronAffinity'),
    },
    { id: 'm-9', label: 'Bandingkan 3 Unsur', done: data.comparisons.length >= 1 },
    { id: 'm-10', label: 'Lakukan Eksperimen Lab Pertama', done: data.labExperiments.length >= 1 },
    { id: 'm-11', label: 'Lakukan Minimal 3 Eksperimen Lab', done: data.labExperiments.length >= 3 },
    { id: 'm-12', label: 'Selesaikan Bagian Memahami di Journey', done: data.learningJourney.understandingDone >= 4 },
    { id: 'm-13', label: 'Selesaikan Tantangan di Journey', done: data.learningJourney.applicationDone >= 3 },
    { id: 'm-14', label: 'Tulis Refleksi Belajar Kimia', done: data.learningJourney.reflectionsCount >= 1 },
    { id: 'm-15', label: 'Selesaikan Kuis Tematik di Challenge', done: data.challenges.quizzesTaken >= 1 },
    {
      id: 'm-16',
      label: 'Coba Speed Challenge / Misi Studi Kasus',
      done: (data.challenges.speedBestScore !== undefined) || data.challenges.missionsCompleted >= 1,
    },
  ];

  const completedMilestonesCount = milestones.filter((m) => m.done).length;
  const overallPercentage = Math.round((completedMilestonesCount / milestones.length) * 100);

  // 5 Category Percentages
  // 1. MEMAHAMI (Learning Journey Section 1 + basic element exploration)
  const memahamiProgress = Math.min(
    100,
    Math.round(
      ((Math.min(data.learningJourney.understandingDone, 4) / 4) * 0.7 +
        (Math.min(data.exploredElements.length, 5) / 5) * 0.3) *
        100
    )
  );

  // 2. MENGAPLIKASIKAN (Learning Journey Challenges + Compare 3 + Lab experiments)
  const mengaplikasikanProgress = Math.min(
    100,
    Math.round(
      ((Math.min(data.learningJourney.applicationDone, 6) / 6) * 0.5 +
        (Math.min(data.comparisons.length, 2) / 2) * 0.25 +
        (Math.min(data.labExperiments.length, 2) / 2) * 0.25) *
        100
    )
  );

  // 3. MEREFLEKSIKAN (Learning Journey Reflections: 5 questions)
  const merefleksikanProgress = Math.min(
    100,
    Math.round((Math.min(data.learningJourney.reflectionsCount, 5) / 5) * 100)
  );

  // 4. CHALLENGE (Phase 8 Quizzes, missions, speed challenge)
  const challengeProgress = Math.min(
    100,
    Math.round(
      ((Math.min(data.challenges.quizzesTaken, 4) / 4) * 0.6 +
        (Math.min(data.challenges.missionsCompleted, 3) / 3) * 0.4) *
        100
    )
  );

  // 5. EKSPLORASI (Atom 3D, AR, periodic trends, compare, lab)
  const eksplorasiProgress = Math.min(
    100,
    Math.round(
      ((Math.min(data.atom3dElements.length, 5) / 5) * 0.25 +
        (data.arSessions.length > 0 ? 1 : 0) * 0.15 +
        (Math.min(data.trendsExplored.length, 4) / 4) * 0.25 +
        (Math.min(data.comparisons.length, 2) / 2) * 0.15 +
        (Math.min(data.labExperiments.length, 4) / 4) * 0.2) *
        100
    )
  );

  // Learning Evidence Items
  const evidenceList = [
    {
      title: 'Mengeksplorasi Unsur',
      done: data.exploredElements.length > 0,
      detail: `${data.exploredElements.length} unsur telah dibuka`,
      action: () => onNavigateToPeriodicTable(),
    },
    {
      title: 'Mengamati Atom 3D',
      done: data.atom3dElements.length > 0,
      detail: `${data.atom3dElements.length} struktur atom diamati`,
      action: () => onNavigateToAtom3D(selectedElement),
    },
    {
      title: 'Membandingkan 3 Unsur',
      done: data.comparisons.length > 0,
      detail: `${data.comparisons.length} perbandingan berdampingan dilakukan`,
      action: () => onNavigateToCompare3(),
    },
    {
      title: 'Mengeksplorasi Sifat Keperiodikan',
      done: data.trendsExplored.length > 0,
      detail: `${data.trendsExplored.length} dari 4 sifat dianalisis`,
      action: () => onNavigateToTrends(),
    },
    {
      title: 'Melakukan Eksperimen Laboratorium',
      done: data.labExperiments.length > 0,
      detail: `${data.labExperiments.length} dari 4 reaksi kimia dicoba`,
      action: () => onNavigateToLab(),
    },
    {
      title: 'Mencoba Augmented Reality (AR)',
      done: data.arSessions.length > 0,
      detail: data.arSessions.length > 0 ? `${data.arSessions.length} sesi AR dijalankan` : 'Belum digunakan',
      action: () => onNavigateToAR(selectedElement),
    },
    {
      title: 'Menyelesaikan Challenge',
      done: data.challenges.totalAnswered > 0,
      detail: data.challenges.totalAnswered > 0 ? `${data.challenges.totalAnswered} soal dikerjakan` : 'Belum dikerjakan',
      action: () => onNavigateToAssessment(),
    },
    {
      title: 'Menulis Refleksi Pembelajaran',
      done: data.learningJourney.reflectionsCount > 0,
      detail: `${data.learningJourney.reflectionsCount} catatan refleksi tersimpan`,
      action: () => onNavigateToJourney(),
    },
  ];

  // Group activities into Today, Yesterday, and Older
  const groupActivitiesByDate = (activities: LearningActivityItem[]) => {
    const today: LearningActivityItem[] = [];
    const yesterday: LearningActivityItem[] = [];
    const older: LearningActivityItem[] = [];

    const now = new Date();
    const todayDateStr = now.toDateString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayDateStr = yesterdayDate.toDateString();

    activities.forEach((act) => {
      const actDate = new Date(act.timestamp);
      const actDateStr = actDate.toDateString();

      if (actDateStr === todayDateStr) {
        today.push(act);
      } else if (actDateStr === yesterdayDateStr) {
        yesterday.push(act);
      } else {
        older.push(act);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupActivitiesByDate(data.activities);

  // Dynamic Insights
  const insights: string[] = [];
  if (data.exploredElements.length > 0) {
    insights.push(`Kamu telah mengeksplorasi ${data.exploredElements.length} unsur.`);
  }
  if (data.atom3dElements.length > 0) {
    insights.push(`Kamu telah mengamati model 3D dari ${data.atom3dElements.length} unsur kimia.`);
  }
  if (data.labExperiments.length > 0) {
    insights.push(`Kamu telah mencoba ${data.labExperiments.length} eksperimen di Chemistry Lab.`);
  }
  if (data.comparisons.length > 0) {
    insights.push(`Kamu telah membandingkan ${data.comparisons.length} kelompok unsur secara berdampingan.`);
  }
  if (data.trendsExplored.length > 0) {
    insights.push(`Kamu sudah mengeksplorasi ${data.trendsExplored.length} dari 4 sifat keperiodikan.`);
  }
  if (data.challenges.totalAnswered > 0) {
    const accuracy = Math.round((data.challenges.correct / data.challenges.totalAnswered) * 100);
    insights.push(`Akurasi tantangan kimiamu adalah ${accuracy}% dari total ${data.challenges.totalAnswered} soal.`);
  }
  if (insights.length === 0) {
    insights.push('Mulai perjalanan belajarmu dengan memilih satu unsur dari tabel periodik atau membuka menu Learning Journey.');
  }

  // Exploration Suggestions based on what is yet uncompleted
  const suggestions: { text: string; action: () => void }[] = [];
  if (data.exploredElements.length < 5) {
    suggestions.push({
      text: '🔍 Jelajahi minimal 5 unsur berbeda untuk mengenali variasi golongan dan periode.',
      action: () => onNavigateToPeriodicTable(),
    });
  }
  if (data.atom3dElements.length < 3) {
    suggestions.push({
      text: '⚛️ Buka Atom 3D untuk mengamati distribusi orbital dan elektron valensi.',
      action: () => onNavigateToAtom3D(selectedElement),
    });
  }
  if (data.arSessions.length === 0) {
    suggestions.push({
      text: '🔎 Coba eksplorasi satu unsur menggunakan AR pada perangkat mobile.',
      action: () => onNavigateToAR(selectedElement),
    });
  }
  if (data.trendsExplored.length < 4) {
    suggestions.push({
      text: '📈 Buka Sifat Keperiodikan untuk melihat tren jari-jari atom, energi ionisasi, dan elektronegativitas.',
      action: () => onNavigateToTrends(),
    });
  }
  if (data.comparisons.length === 0) {
    suggestions.push({
      text: '⚖️ Bandingkan tiga unsur dari satu periode (contoh: Na, Mg, Cl) untuk melihat perbedaan sifat atomik.',
      action: () => onNavigateToCompare3(),
    });
  }
  if (data.labExperiments.length < 4) {
    suggestions.push({
      text: '🧪 Lakukan eksperimen reaksi kimia seperti Cuka + Soda Kue di Chemistry Lab.',
      action: () => onNavigateToLab(),
    });
  }
  if (data.challenges.totalAnswered === 0) {
    suggestions.push({
      text: '🎯 Uji pemahaman konsepmu di Challenge & Assessment dengan kuis tematik dan speed challenge.',
      action: () => onNavigateToAssessment(),
    });
  }
  if (data.learningJourney.reflectionsCount === 0) {
    suggestions.push({
      text: '💭 Tuliskan temuan atau keunikan atom yang kamu pelajari di bagian Merefleksikan pada Learning Journey.',
      action: () => onNavigateToJourney(),
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      text: '✨ Semua area utama sudah dieksplorasi. Kamu dapat mengulangi aktivitas dengan unsur dan eksperimen yang berbeda.',
      action: () => onNavigateToPeriodicTable(),
    });
  }

  // Handle Export Progress
  const handleExport = () => {
    try {
      const exportBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(exportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `atom3d_learning_progress_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('✓ Progress belajar berhasil diekspor ke file JSON');
    } catch (e) {
      console.error(e);
      showToast('Gagal mengekspor file progress');
    }
  };

  // Handle Import Progress
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (validateImportedProgress(parsed)) {
          saveLearningProgress(parsed);
          setData(parsed);
          showToast('✓ Progress belajar berhasil diimpor!');
        } else {
          showToast('File progress tidak valid.');
        }
      } catch (err) {
        showToast('File progress tidak valid.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Reset Progress
  const handleConfirmReset = () => {
    const resetData = resetLearningProgress();
    setData(resetData);
    setShowResetModal(false);
    showToast('✓ Seluruh data progress belajar lokal telah direset.');
  };

  // Format local timestamp
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-cyan-950 border border-cyan-500/80 text-cyan-200 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Main Header Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>PROGRESS BELAJAR</span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
                  Phase 9 • Analytics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Lihat perjalanan belajarmu di ATOM 3D.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Cetak Ringkasan Belajar atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>🖨 Ringkasan</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700/80 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Unduh data progress dalam file JSON lokal"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 Export</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 border border-slate-700/80 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Muat data progress dari file JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>📤 Import</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Reset seluruh progress belajar di perangkat ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Progress Belajar Summary Card */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-3/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PROGRESS KESELURUHAN
              </span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                {overallPercentage}%
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-sm shadow-cyan-500/30"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Aktivitas selesai: <strong className="text-slate-100">{completedMilestonesCount} / {milestones.length}</strong></span>
              <span>Berdasarkan interaksi aktif pengguna</span>
            </div>
          </div>

          {/* Quick Stats Pill Counters */}
          <div className="w-full md:w-2/5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Unsur</span>
              <span className="text-lg font-black text-cyan-400">{data.exploredElements.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Atom 3D</span>
              <span className="text-lg font-black text-teal-400">{data.atom3dElements.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Eksperimen</span>
              <span className="text-lg font-black text-emerald-400">{data.labExperiments.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Perbandingan</span>
              <span className="text-lg font-black text-amber-400">{data.comparisons.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tren</span>
              <span className="text-lg font-black text-rose-400">{data.trendsExplored.length} / 4</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Challenge</span>
              <span className="text-lg font-black text-purple-400">{data.challenges.totalAnswered}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Progress Grid (5 Kategori) */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>Kategori Progress Belajar</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. MEMAHAMI */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  MEMAHAMI
                </span>
              </div>
              <span className="text-sm font-extrabold text-cyan-400">{memahamiProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${memahamiProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Eksplorasi konsep dasar atom & pengenalan unsur kimia.
            </p>
          </div>

          {/* 2. MENGAPLIKASIKAN */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧪</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  MENGAPLIKASIKAN
                </span>
              </div>
              <span className="text-sm font-extrabold text-teal-400">{mengaplikasikanProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${mengaplikasikanProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Penerapan prinsip kimia pada tantangan, perbandingan, & lab.
            </p>
          </div>

          {/* 3. MEREFLEKSIKAN */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💭</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  MEREFLEKSIKAN
                </span>
              </div>
              <span className="text-sm font-extrabold text-indigo-400">{merefleksikanProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${merefleksikanProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Renungan temuan menarik, analogi, & pertanyaan lanjutan.
            </p>
          </div>

          {/* 4. CHALLENGE */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  CHALLENGE
                </span>
              </div>
              <span className="text-sm font-extrabold text-amber-400">{challengeProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${challengeProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluasi kuis tematik, tantangan kecepatan, & studi kasus.
            </p>
          </div>

          {/* 5. EKSPLORASI */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 transition-all space-y-2.5 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔬</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  EKSPLORASI
                </span>
              </div>
              <span className="text-sm font-extrabold text-rose-400">{eksplorasiProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${eksplorasiProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Penjelajahan interaktif 3D Atom, AR, sifat tren periodik, & reaksi gelas kimia.
            </p>
          </div>
        </div>
      </section>

      {/* Grid: Unsur Dieksplorasi, Atom 3D, AR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 4: Unsur Dieksplorasi */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>UNSUR DIEKSPLORASI</span>
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {data.exploredElements.length}
              </span>
            </div>

            {data.exploredElements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada unsur yang dieksplorasi.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {data.exploredElements.map((sym) => {
                  const el = getElementBySymbol(sym);
                  return (
                    <span
                      key={sym}
                      className="px-2 py-1 rounded-lg bg-slate-950 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1 shadow-sm"
                      title={el ? `${el.name} (Z=${el.atomicNumber})` : sym}
                    >
                      <span>{sym}</span>
                      <Check className="w-3 h-3 text-cyan-400" />
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {data.exploredElements.length} unsur telah dieksplorasi.
            </span>
            <button
              type="button"
              onClick={() => onNavigateToPeriodicTable()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Tabel</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Section 5: Atom 3D Exploration */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="text-teal-400">⚛</span>
                <span>ATOM 3D</span>
              </h3>
              <span className="text-xs font-mono font-bold text-teal-400">
                {data.atom3dElements.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">Unsur yang telah diamati:</p>

            {data.atom3dElements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada unsur yang dieksplorasi.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {data.atom3dElements.map((sym) => {
                  const el = getElementBySymbol(sym);
                  return (
                    <span
                      key={sym}
                      onClick={() => el && onNavigateToAtom3D(el)}
                      className="px-2.5 py-1 rounded-lg bg-teal-950/40 border border-teal-500/40 text-xs font-mono font-bold text-teal-300 cursor-pointer hover:bg-teal-900/40 transition-colors"
                      title={el ? `Buka model 3D ${el.name}` : sym}
                    >
                      {sym}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {data.atom3dElements.length > 0
                ? `${data.atom3dElements.length} unsur diamati dalam Atom 3D.`
                : 'Belum ada unsur yang dieksplorasi.'}
            </span>
            <button
              type="button"
              onClick={() => onNavigateToAtom3D(selectedElement)}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Buka 3D</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Section 6: AR Exploration */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>🥽</span>
                <span>AR EXPLORATION</span>
              </h3>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {data.arSessions.length} sesi
              </span>
            </div>

            {data.arSessions.length === 0 ? (
              <div className="py-2 text-xs text-slate-400 space-y-1">
                <p className="text-slate-300 font-medium">AR belum digunakan pada perangkat ini.</p>
                <p className="text-[11px] text-slate-500">
                  Gunakan tombol AR di viewer untuk memproyeksikan atom ke meja nyata.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400">Unsur yang pernah dicoba:</span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set(data.arSessions.map((s) => s.symbol))).map((sym) => (
                    <span
                      key={sym}
                      className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Jumlah sesi AR: <strong className="text-slate-200">{data.arSessions.length}</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigateToAR(selectedElement)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Coba AR</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Periodic Trends, Compare 3 Elements, Chemistry Lab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 7: Periodic Trends */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>SIFAT KEPERIODIKAN</span>
              </h3>
              <span className="text-xs font-mono font-bold text-amber-400">
                {data.trendsExplored.length} / 4
              </span>
            </div>

            <div className="space-y-2">
              {CANONICAL_TRENDS.map((trend) => {
                const isExplored = data.trendsExplored.includes(trend.key);
                return (
                  <div
                    key={trend.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-300 font-medium">{trend.label}</span>
                    <span className="flex items-center gap-1">
                      {isExplored ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-600 font-bold">○</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {data.trendsExplored.length} dari 4 sifat keperiodikan telah dieksplorasi.
            </span>
            <button
              type="button"
              onClick={() => onNavigateToTrends()}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Tren</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Section 8: Compare 3 Elements */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>PERBANDINGAN</span>
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {data.comparisons.length} sesi
              </span>
            </div>

            {data.comparisons.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada perbandingan 3 unsur yang dilakukan.
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {data.comparisons.slice(0, 5).map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="font-mono font-bold text-cyan-300">
                      {idx + 1}. {comp.elements.join(' — ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTime(comp.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {data.comparisons.length} perbandingan telah dilakukan.
            </span>
            <button
              type="button"
              onClick={() => onNavigateToCompare3()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Bandingkan</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Section 9: Chemistry Lab */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>CHEMISTRY LAB</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {data.labExperiments.length} / {CANONICAL_EXPERIMENTS.length}
              </span>
            </div>

            <div className="space-y-2">
              {CANONICAL_EXPERIMENTS.map((exp) => {
                const isDone = data.labExperiments.some((e) => e.id === exp.id);
                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-300 font-medium truncate pr-2">
                      {exp.title}
                    </span>
                    <span className="flex items-center gap-1">
                      {isDone ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span className="text-slate-600 font-bold">○</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {data.labExperiments.length} dari {CANONICAL_EXPERIMENTS.length} eksperimen telah dicoba.
            </span>
            <button
              type="button"
              onClick={() => onNavigateToLab()}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Lab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Learning Journey & Challenge Assessment Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 10: Learning Journey Integration */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>LEARNING JOURNEY (PHASE 7)</span>
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {data.learningJourney.summaryPercentage}%
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300 font-medium">Memahami</span>
                <span className="font-bold text-cyan-400">
                  {data.learningJourney.understandingDone >= 4
                    ? '✓ Selesai'
                    : `${data.learningJourney.understandingDone} / 4 aktivitas`}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300 font-medium">Mengaplikasikan</span>
                <span className="font-bold text-teal-400">
                  {data.learningJourney.applicationDone >= 6
                    ? '✓ Selesai'
                    : `${data.learningJourney.applicationDone} / 6 tantangan`}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300 font-medium">Merefleksikan</span>
                <span className="font-bold text-indigo-400">
                  {data.learningJourney.reflectionsCount} / 5
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Progress: <strong className="text-slate-200">{data.learningJourney.summaryPercentage}%</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigateToJourney()}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Lanjutkan Journey</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section 11 & 12: Challenge & Assessment Integration */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>CHALLENGE & ASSESSMENT (PHASE 8)</span>
              </h3>
              <span className="text-xs font-mono font-bold text-purple-300">
                {data.challenges.totalAnswered > 0 ? `${Math.round((data.challenges.correct / data.challenges.totalAnswered) * 100)}% Akurasi` : 'Belum Mulai'}
              </span>
            </div>

            {data.challenges.totalAnswered === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-300">Soal belum dikerjakan.</p>
                <p className="text-[11px] text-slate-500">
                  Buka menu Challenge untuk mengerjakan kuis tematik, speed challenge, atau investigasi kasus.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Soal</span>
                  <span className="text-base font-black text-slate-100">{data.challenges.totalAnswered}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Benar</span>
                  <span className="text-base font-black text-emerald-400">{data.challenges.correct}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">Salah</span>
                  <span className="text-base font-black text-rose-400">{data.challenges.incorrect}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Akurasi</span>
                  <span className="text-base font-black text-amber-400">
                    {Math.round((data.challenges.correct / data.challenges.totalAnswered) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Kuis selesai: <strong className="text-slate-200">{data.challenges.quizzesTaken}</strong> paket
            </span>
            <button
              type="button"
              onClick={() => onNavigateToAssessment()}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Challenge</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Section 13: Learning Evidence (📁 LEARNING EVIDENCE) */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📁</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              LEARNING EVIDENCE
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {evidenceList.filter((e) => e.done).length} / {evidenceList.length} Terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {evidenceList.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                item.done
                  ? 'bg-slate-950/70 border-emerald-500/40 hover:border-emerald-400 shadow-sm'
                  : 'bg-slate-950/30 border-slate-800 hover:border-slate-700 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 leading-snug">
                  {item.title}
                </span>
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 14 & 15: Timeline Belajar (🕒 AKTIVITAS TERAKHIR) */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              AKTIVITAS TERAKHIR
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Maks. 30 log lokal
          </span>
        </div>

        {data.activities.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
            Belum ada catatan aktivitas. Interaksi seperti membuka unsur, membandingkan atom, atau menjalankan lab akan otomatis tercatat di sini.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hari ini */}
            {today.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40 inline-block">
                  Hari Ini
                </span>
                <div className="space-y-1.5">
                  {today.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs gap-3 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        <span className="text-slate-200 font-medium truncate">{act.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {formatTime(act.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kemarin */}
            {yesterday.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 inline-block">
                  Kemarin
                </span>
                <div className="space-y-1.5">
                  {yesterday.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs gap-3 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                        <span className="text-slate-300 font-medium truncate">{act.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {formatTime(act.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lebih Awal */}
            {older.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 inline-block">
                  Sebelumnya
                </span>
                <div className="space-y-1.5">
                  {older.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs gap-3 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                        <span className="text-slate-400 font-medium truncate">{act.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {formatDate(act.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Grid: Insight Belajar & Saran Eksplorasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 16: Insight Belajar (💡 INSIGHT BELAJAR) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3.5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              INSIGHT BELAJAR
            </h2>
          </div>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
              >
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 17: Saran Eksplorasi (SARAN EKSPLORASI) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              SARAN EKSPLORASI
            </h2>
          </div>
          <div className="space-y-2">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                onClick={sug.action}
                className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-teal-500/40 text-xs text-slate-200 leading-relaxed cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <span>{sug.text}</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-400 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Section 20: Privacy Note */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Progress belajar disimpan secara lokal di perangkat ini. Tanpa akun, tanpa tracking pihak ketiga.</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
          Local Engine v1.0
        </span>
      </div>

      {/* Confirmation Modal: Reset Progress */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-rose-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Reset Progress Belajar</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah kamu yakin ingin menghapus progress belajar?
            </p>
            <p className="text-[11px] text-slate-400">
              Tindakan ini akan mengosongkan riwayat unsur yang telah dibuka, catatan eksperimen, kuis, dan timeline aktivitas lokal pada browser ini. Data 118 unsur kimia dan modul aplikasi tidak akan terhapus.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
              >
                Hapus Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Summary Modal / View */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">🖨 Ringkasan Belajar (Siap Cetak / PDF)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Sheet View */}
            <div id="printable-summary" className="p-6 rounded-2xl bg-white text-slate-900 space-y-4 font-sans text-xs">
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-950">
                    ATOM 3D — LEARNING SUMMARY
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    Ringkasan Bukti Pembelajaran & Eksplorasi Sains Kimia
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Tanggal: {new Date().toLocaleDateString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Design by ZP
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-200">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Progress Belajar</span>
                  <span className="text-2xl font-black text-slate-900">{overallPercentage}%</span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">
                    {completedMilestonesCount} dari {milestones.length} aktivitas selesai
                  </span>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Unsur Dieksplorasi</span>
                  <span className="text-2xl font-black text-slate-900">{data.exploredElements.length}</span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">
                    {data.atom3dElements.length} diamati di Atom 3D
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 py-2 border-b border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Eksperimen Lab</span>
                  <span className="text-base font-bold text-slate-900">{data.labExperiments.length} dicoba</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Challenge</span>
                  <span className="text-base font-bold text-slate-900">{data.challenges.totalAnswered} soal</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Refleksi</span>
                  <span className="text-base font-bold text-slate-900">{data.learningJourney.reflectionsCount} catatan</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-900 block">Bukti Aktivitas Pembelajaran:</span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                  {evidenceList.map((e, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span>{e.done ? '☑' : '☐'}</span>
                      <span>{e.title} ({e.detail})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
                <span>ATOM 3D Engine • Disimpan secara lokal</span>
                <span>Dokumen Otentik Siswa</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
