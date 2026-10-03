import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChemicalElement, ElementCategory } from './types/element';
import { ELEMENTS, getElementByNumber, TOTAL_ELEMENTS_COUNT } from './data/elements';
import { filterElements } from './utils/chemistry';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetail } from './components/ElementDetail';
import { LearningGuideModal } from './components/LearningGuideModal';
import { Footer } from './components/Footer';
import { CATEGORIES } from './utils/categories';
import {
  PeriodicPropertyKey,
  PERIODIC_PROPERTIES,
  TrendCategory,
} from './data/periodic-trends-data';
import { PeriodicTrendsControl } from './components/PeriodicTrendsControl';
import { ChemistryLab } from './components/ChemistryLab';
import { CompareSelectionToolbar } from './components/CompareSelectionToolbar';
import { CompareThreeElements } from './components/CompareThreeElements';
import { LearningJourney } from './components/LearningJourney';
import { ChallengeAssessment } from './components/ChallengeAssessment';
import { LearningProgressDashboard } from './components/LearningProgressDashboard';
import { PWAInstallModal } from './components/PWAInstallModal';
import { AboutModal } from './components/AboutModal';
import { AppLaunchSplash } from './components/AppLaunchSplash';
import { OfflineIndicator } from './components/OfflineIndicator';
import { UpdateNotification } from './components/UpdateNotification';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  trackElementExplored,
  trackCompare3Elements,
  trackTrendExplored,
} from './utils/learning-progress-storage';
import { Eye, TrendingUp, FlaskConical, Scale, Compass, ArrowLeft, Target, BarChart3 } from 'lucide-react';

export default function App() {
  // Default to Natrium (Z=11) as classic chemistry example, or Hydrogen (Z=1)
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(() => {
    return getElementByNumber(11) || ELEMENTS[0];
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'Semua'>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLearningModalOpen, setIsLearningModalOpen] = useState<boolean>(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // PWA Install hook
  const { isInstalled, isInstallable } = usePWAInstall();

  // App Modes: 'standard' (Phase 1-3), 'trends' (Phase 4), 'lab' (Phase 6), 'journey' (Phase 7), 'assessment' (Phase 8), 'progress' (Phase 9)
  const [activeMode, setActiveMode] = useState<'standard' | 'trends' | 'lab' | 'journey' | 'assessment' | 'progress'>('standard');
  const [activeTrendProperty, setActiveTrendProperty] =
    useState<PeriodicPropertyKey>('atomicRadius');
  const [trendLevelFilter, setTrendLevelFilter] =
    useState<TrendCategory | 'Semua'>('Semua');

  // Track if user navigated to a feature from Learning Journey so they can easily return
  const [isNavigatedFromJourney, setIsNavigatedFromJourney] = useState<boolean>(false);
  // Track if user navigated to a feature from Challenge & Assessment so they can easily return
  const [isNavigatedFromAssessment, setIsNavigatedFromAssessment] = useState<boolean>(false);
  // Track if user navigated to a feature from Progress Belajar so they can easily return
  const [isNavigatedFromProgress, setIsNavigatedFromProgress] = useState<boolean>(false);

  // Compare 3 Elements feature state
  const [isCompareSelectionMode, setIsCompareSelectionMode] = useState<boolean>(false);
  const [selectedCompareElements, setSelectedCompareElements] = useState<ChemicalElement[]>([]);
  const [compareWarningMessage, setCompareWarningMessage] = useState<string | null>(null);
  const [isViewingComparison, setIsViewingComparison] = useState<boolean>(false);

  // Filter elements based on search and category
  const filteredElements = useMemo(() => {
    return filterElements(ELEMENTS, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Handle element selection (tracks exploration)
  const handleSelectElement = useCallback((element: ChemicalElement) => {
    setSelectedElement(element);
    trackElementExplored(element.symbol, element.name);
    // On small screens, opening the detail modal automatically upon tap
    if (window.innerWidth < 1024) {
      setIsMobileDetailOpen(true);
    }
  }, []);

  // Handle trend property selection (tracks trend exploration)
  const handleSelectTrendProperty = useCallback((property: PeriodicPropertyKey) => {
    setActiveTrendProperty(property);
    const propInfo = PERIODIC_PROPERTIES[property];
    if (propInfo) {
      trackTrendExplored(property, propInfo.name);
    }
  }, []);

  // Navigation: Previous element
  const handleNavigatePrev = useCallback(() => {
    if (selectedElement.atomicNumber > 1) {
      const prev = getElementByNumber(selectedElement.atomicNumber - 1);
      if (prev) setSelectedElement(prev);
    }
  }, [selectedElement.atomicNumber]);

  // Navigation: Next element
  const handleNavigateNext = useCallback(() => {
    if (selectedElement.atomicNumber < TOTAL_ELEMENTS_COUNT) {
      const next = getElementByNumber(selectedElement.atomicNumber + 1);
      if (next) setSelectedElement(next);
    }
  }, [selectedElement.atomicNumber]);

  // Compare 3 Elements Handlers
  const handleToggleCompareElement = useCallback((element: ChemicalElement) => {
    setSelectedElement(element);
    const isAlreadySelected = selectedCompareElements.some(
      (el) => el.atomicNumber === element.atomicNumber
    );

    if (isAlreadySelected) {
      setCompareWarningMessage(`Unsur sudah dipilih: ${element.symbol} — ${element.name}`);
      return;
    }

    if (selectedCompareElements.length >= 3) {
      setCompareWarningMessage(
        '3 unsur telah dipilih. Tekan tombol "Bandingkan" atau hapus salah satu unsur terlebih dahulu.'
      );
      return;
    }

    setCompareWarningMessage(null);
    setSelectedCompareElements((prev) => [...prev, element]);
  }, [selectedCompareElements]);

  const handleRemoveCompareElement = useCallback((index: number) => {
    setSelectedCompareElements((prev) => prev.filter((_, i) => i !== index));
    setCompareWarningMessage(null);
  }, []);

  const handleResetCompareSelection = useCallback(() => {
    setSelectedCompareElements([]);
    setCompareWarningMessage(null);
  }, []);

  const handleStartComparison = useCallback(() => {
    if (selectedCompareElements.length === 3) {
      setIsViewingComparison(true);
      trackCompare3Elements(
        selectedCompareElements.map((e) => e.symbol),
        selectedCompareElements.map((e) => e.name)
      );
    }
  }, [selectedCompareElements]);

  const handleCancelCompareSelection = useCallback(() => {
    setIsCompareSelectionMode(false);
    setSelectedCompareElements([]);
    setCompareWarningMessage(null);
    setIsViewingComparison(false);
  }, []);

  const handleBackFromComparison = useCallback(() => {
    setIsViewingComparison(false);
  }, []);

  const handleResetFromComparison = useCallback(() => {
    setIsViewingComparison(false);
    setIsCompareSelectionMode(true);
    setSelectedCompareElements([]);
    setCompareWarningMessage(null);
  }, []);

  const handleOpenAtom3DFromCompare = useCallback((element: ChemicalElement) => {
    setSelectedElement(element);
    setActiveMode('standard');
    setIsViewingComparison(false);
    setIsCompareSelectionMode(false);
    if (window.innerWidth < 1024) {
      setIsMobileDetailOpen(true);
    }
  }, []);

  // Keyboard shortcut listener (arrow keys for prev/next element)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in search input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handleNavigatePrev();
      } else if (e.key === 'ArrowRight') {
        handleNavigateNext();
      } else if (e.key === 'Escape') {
        setIsMobileDetailOpen(false);
        setIsLearningModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigatePrev, handleNavigateNext]);

  // Prevent reload while user is in active experiment, challenge, or reflection
  const handleBeforeReload = useCallback(() => {
    if (activeMode === 'lab') {
      return window.confirm(
        'Eksperimen sedang berjalan di Laboratorium Kimia. Apakah Anda yakin ingin memuat ulang untuk memperbarui versi ATOM 3D?'
      );
    }
    if (activeMode === 'assessment') {
      return window.confirm(
        'Tantangan atau evaluasi sedang aktif. Apakah Anda yakin ingin memuat ulang untuk memperbarui versi ATOM 3D?'
      );
    }
    return true;
  }, [activeMode]);

  const catInfo = CATEGORIES[selectedElement.category];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* App Launch Splash (PWA Experience) */}
      <AppLaunchSplash />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Service Worker Safe Update Notification */}
      <UpdateNotification onBeforeReload={handleBeforeReload} />

      {/* Header */}
      <Header
        onOpenLearning={() => setIsLearningModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        activeMode={activeMode}
        onToggleActiveMode={setActiveMode}
        onOpenInstallGuide={() => setIsInstallModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        isInstalled={isInstalled}
      />

      {/* Return to Learning Journey Banner if user navigated to a feature from Journey */}
      {isNavigatedFromJourney && activeMode !== 'journey' && (
        <div className="sticky top-16 z-30 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border-b border-indigo-500/60 px-4 py-2 text-xs shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-200">
              Sedang mengeksplorasi dari <strong>Learning Journey</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveMode('journey');
              setIsViewingComparison(false);
              setIsCompareSelectionMode(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Kembali ke Learning Journey</span>
          </button>
        </div>
      )}

      {/* Return to Assessment Floating Alert Banner */}
      {isNavigatedFromAssessment && activeMode !== 'assessment' && (
        <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/40 px-4 py-2.5 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-200">
              Sedang mengeksplorasi dari <strong>Challenge & Assessment</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveMode('assessment');
              setIsViewingComparison(false);
              setIsCompareSelectionMode(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-400 hover:to-purple-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Kembali ke Challenge</span>
          </button>
        </div>
      )}

      {/* Return to Progress Floating Alert Banner */}
      {isNavigatedFromProgress && activeMode !== 'progress' && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border-b border-cyan-500/40 px-4 py-2.5 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-200">
              Sedang mengeksplorasi dari <strong>Progress Belajar</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveMode('progress');
              setIsViewingComparison(false);
              setIsCompareSelectionMode(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Kembali ke Progress</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4">
        {activeMode === 'progress' ? (
          /* Phase 9: Learning Analytics & Learning Evidence */
          <LearningProgressDashboard
            selectedElement={selectedElement}
            onNavigateToPeriodicTable={(el) => {
              if (el) setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromProgress(true);
            }}
            onNavigateToAtom3D={(el) => {
              setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromProgress(true);
              if (window.innerWidth < 1024) {
                setIsMobileDetailOpen(true);
              }
            }}
            onNavigateToTrends={() => {
              setActiveMode('trends');
              setIsNavigatedFromProgress(true);
            }}
            onNavigateToCompare3={() => {
              setActiveMode('trends');
              setIsCompareSelectionMode(true);
              setIsNavigatedFromProgress(true);
            }}
            onNavigateToLab={() => {
              setActiveMode('lab');
              setIsNavigatedFromProgress(true);
            }}
            onNavigateToJourney={() => {
              setActiveMode('journey');
              setIsNavigatedFromProgress(true);
            }}
            onNavigateToAssessment={() => {
              setActiveMode('assessment');
              setIsNavigatedFromProgress(true);
            }}
            onNavigateToAR={(el) => {
              setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromProgress(true);
              if (window.innerWidth < 1024) {
                setIsMobileDetailOpen(true);
              }
            }}
            onClose={() => {
              setActiveMode('standard');
              setIsNavigatedFromProgress(false);
            }}
          />
        ) : activeMode === 'assessment' ? (
          /* Phase 8: Challenge & Assessment View */
          <ChallengeAssessment
            selectedElement={selectedElement}
            onNavigateToPeriodicTable={(el) => {
              if (el) setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromAssessment(true);
            }}
            onNavigateToAtom3D={(el) => {
              setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromAssessment(true);
              if (window.innerWidth < 1024) {
                setIsMobileDetailOpen(true);
              }
            }}
            onNavigateToTrends={() => {
              setActiveMode('trends');
              setIsNavigatedFromAssessment(true);
            }}
            onNavigateToCompare3={() => {
              setActiveMode('trends');
              setIsCompareSelectionMode(true);
              setIsNavigatedFromAssessment(true);
            }}
            onNavigateToLab={() => {
              setActiveMode('lab');
              setIsNavigatedFromAssessment(true);
            }}
            onCloseAssessment={() => {
              setActiveMode('standard');
              setIsNavigatedFromAssessment(false);
            }}
          />
        ) : activeMode === 'journey' ? (
          /* Phase 7: Learning Journey View */
          <LearningJourney
            onNavigateToPeriodicTable={(el) => {
              if (el) setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromJourney(true);
            }}
            onNavigateToAtom3D={(el) => {
              setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromJourney(true);
              if (window.innerWidth < 1024) {
                setIsMobileDetailOpen(true);
              }
            }}
            onNavigateToTrends={() => {
              setActiveMode('trends');
              setIsNavigatedFromJourney(true);
            }}
            onNavigateToCompare3={() => {
              setActiveMode('trends');
              setIsCompareSelectionMode(true);
              setIsNavigatedFromJourney(true);
            }}
            onNavigateToLab={() => {
              setActiveMode('lab');
              setIsNavigatedFromJourney(true);
            }}
            onNavigateToAR={(el) => {
              setSelectedElement(el);
              setActiveMode('standard');
              setIsNavigatedFromJourney(true);
              if (window.innerWidth < 1024) {
                setIsMobileDetailOpen(true);
              }
            }}
            onCloseJourney={() => {
              setActiveMode('standard');
              setIsNavigatedFromJourney(false);
            }}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
          />
        ) : isViewingComparison && selectedCompareElements.length === 3 ? (
          /* Compare 3 Elements Full View */
          <CompareThreeElements
            elements={selectedCompareElements}
            onBack={handleBackFromComparison}
            onResetSelection={handleResetFromComparison}
            onOpenAtom3D={handleOpenAtom3DFromCompare}
          />
        ) : activeMode === 'lab' ? (
          /* Phase 6: Virtual Chemistry Lab View */
          <ChemistryLab
            onSelectElement={handleSelectElement}
            onNavigateToPeriodicTable={() => setActiveMode('standard')}
            onOpenAtom3D={(el) => {
              handleSelectElement(el);
              if (window.innerWidth < 1024) {
                setIsMobileDetailOpen(true);
              }
            }}
          />
        ) : (
          /* Periodic Table & Trends View */
          <>
            {/* Phase 4: Periodic Trends Control Panel OR Compare 3 Elements Selection Toolbar */}
            {isCompareSelectionMode ? (
              <CompareSelectionToolbar
                selectedElements={selectedCompareElements}
                warningMessage={compareWarningMessage}
                onClearWarning={() => setCompareWarningMessage(null)}
                onRemoveElement={handleRemoveCompareElement}
                onResetSelection={handleResetCompareSelection}
                onStartComparison={handleStartComparison}
                onCancel={handleCancelCompareSelection}
              />
            ) : activeMode === 'trends' ? (
              <div className="space-y-3">
                <PeriodicTrendsControl
                  activeProperty={activeTrendProperty}
                  onSelectProperty={handleSelectTrendProperty}
                  levelFilter={trendLevelFilter}
                  onSelectLevelFilter={setTrendLevelFilter}
                  onResetToStandard={() => setActiveMode('standard')}
                  onOpenCompareMode={() => {
                    setIsCompareSelectionMode(true);
                    setSelectedCompareElements([]);
                    setCompareWarningMessage(null);
                  }}
                  isCompareModeActive={isCompareSelectionMode}
                />

                {/* Compact Search Bar in Trends Mode */}
                <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-80">
                    <SearchBar
                      query={searchQuery}
                      onQueryChange={setSearchQuery}
                      resultCount={filteredElements.length}
                      totalCount={TOTAL_ELEMENTS_COUNT}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Warna kotak unsur mencerminkan nilai</span>
                    <span className="font-bold text-amber-300">
                      {activeTrendProperty === 'atomicRadius' && 'Jari-Jari Atom (Å)'}
                      {activeTrendProperty === 'ionizationEnergy' && 'Energi Ionisasi (kJ/mol)'}
                      {activeTrendProperty === 'electronegativity' && 'Elektronegativitas (Pauling)'}
                      {activeTrendProperty === 'electronAffinity' && 'Afinitas Elektron (kJ/mol)'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Search & Category Filter Section */
              <section className="space-y-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="w-full md:w-96 shrink-0">
                    <SearchBar
                      query={searchQuery}
                      onQueryChange={setSearchQuery}
                      resultCount={filteredElements.length}
                      totalCount={TOTAL_ELEMENTS_COUNT}
                    />
                  </div>
                  <div className="w-full overflow-hidden flex-1">
                    <CategoryFilter
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                    />
                  </div>
                  <div className="hidden xl:flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMode('trends')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                      title="Buka Visualisasi Sifat Keperiodikan Unsur"
                    >
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>Sifat Keperiodikan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMode('lab')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer"
                      title="Buka Laboratorium Kimia Virtual"
                    >
                      <FlaskConical className="w-4 h-4 text-teal-400" />
                      <span>Chemistry Lab</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Periodic Table / Cards Explorer */}
              <section className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 space-y-3">
                <PeriodicTable
                  selectedElement={selectedElement}
                  onSelectElement={handleSelectElement}
                  filteredElements={filteredElements}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  viewMode={viewMode}
                  trendProperty={activeMode === 'trends' ? activeTrendProperty : null}
                  trendLevelFilter={activeMode === 'trends' ? trendLevelFilter : 'Semua'}
                  isCompareMode={isCompareSelectionMode}
                  selectedCompareElements={selectedCompareElements}
                  onToggleCompareElement={handleToggleCompareElement}
                />

                {/* Helper tips under periodic table */}
                <div className="hidden sm:flex items-center justify-between text-xs text-slate-500 px-2 py-1">
                  <span>
                    {isCompareSelectionMode
                      ? '💡 Klik kotak unsur pada tabel untuk dipilih. Maksimal dan tepat 3 unsur untuk perbandingan.'
                      : activeMode === 'trends'
                      ? '💡 Setiap kotak menampilkan nilai numerik sifat terpilih. Klik unsur untuk melihat detail lengkap.'
                      : '💡 Klik unsur mana saja untuk melihat konfigurasi elektron dan struktur atom lengkap.'}
                  </span>
                  <span className="font-mono">
                    {isCompareSelectionMode
                      ? `${selectedCompareElements.length} / 3 unsur dipilih`
                      : 'Gunakan panah ⬅ ➡ untuk beralih unsur'}
                  </span>
                </div>
              </section>

              {/* Right Column: Element Detail Panel (Desktop docked view) */}
              <aside className="hidden lg:block lg:col-span-4 xl:col-span-4 2xl:col-span-4 sticky top-20 max-h-[calc(100vh-6rem)]">
                <ElementDetail
                  element={selectedElement}
                  onNavigatePrev={handleNavigatePrev}
                  onNavigateNext={handleNavigateNext}
                />
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Card on Mobile/Tablet Screen */}
      {!isViewingComparison && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 pointer-events-none">
          {isCompareSelectionMode ? (
            <div className="pointer-events-auto p-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/80 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Scale className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">
                    {selectedCompareElements.length} / 3 Unsur
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">
                    {selectedCompareElements.map((el) => el.symbol).join(', ') || 'Belum ada dipilih'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetCompareSelection}
                  disabled={selectedCompareElements.length === 0}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700 cursor-pointer disabled:opacity-40"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleStartComparison}
                  disabled={selectedCompareElements.length !== 3}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all ${
                    selectedCompareElements.length === 3
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                      : 'bg-slate-800 text-slate-500 opacity-50'
                  }`}
                >
                  Bandingkan
                </button>
              </div>
            </div>
          ) : (
            <div
              className="pointer-events-auto p-2.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => setIsMobileDetailOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold border shrink-0"
                  style={{
                    borderColor: catInfo.accentColor,
                    backgroundColor: '#020617',
                  }}
                >
                  <span className="text-[10px] text-slate-400 font-mono leading-none">
                    {selectedElement.atomicNumber}
                  </span>
                  <span className="text-lg font-black text-white leading-none">
                    {selectedElement.symbol}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">{selectedElement.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedElement.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-400 font-mono">
                    Konfigurasi: {selectedElement.electronConfiguration}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Detail</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Element Detail Modal / Bottom Sheet */}
      {isMobileDetailOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileDetailOpen(false)}
          />
          <div className="relative z-10 w-full max-h-[88vh] rounded-t-3xl bg-slate-900 border-t border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-250">
            {/* Mobile Drag Indicator Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mt-2.5 mb-1 shrink-0" />
            <div className="flex-1 overflow-hidden">
              <ElementDetail
                element={selectedElement}
                onClose={() => setIsMobileDetailOpen(false)}
                onNavigatePrev={handleNavigatePrev}
                onNavigateNext={handleNavigateNext}
                isMobileModal
              />
            </div>
          </div>
        </div>
      )}

      {/* Learning Guide Modal (📚 Belajar) */}
      <LearningGuideModal
        isOpen={isLearningModalOpen}
        onClose={() => setIsLearningModalOpen(false)}
      />

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* About ATOM 3D Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenInstallGuide={() => setIsInstallModalOpen(true)}
      />

      {/* Footer */}
      <Footer
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenInstallGuide={() => setIsInstallModalOpen(true)}
      />
    </div>
  );
}
