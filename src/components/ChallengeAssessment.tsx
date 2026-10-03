import React, { useState, useEffect, useRef } from 'react';
import {
  ASSESSMENT_PACKAGES,
  AssessmentTopic,
  AssessmentPackage,
  AssessmentQuestion,
  SPEED_CHALLENGE_BANK,
  CASE_STUDY_MISSIONS,
  CaseStudyMission,
} from '../data/assessment-challenge-data';
import {
  loadAssessmentHistory,
  savePackageScore,
  saveSpeedChallengeScore,
  completeMission,
  clearAssessmentHistory,
  AssessmentHistory,
} from '../utils/assessment-storage';
import { ChemicalElement } from '../types/element';
import { getElementByNumber } from '../data/elements';
import {
  Trophy,
  Target,
  Zap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Atom,
  TrendingUp,
  FlaskConical,
  Scale,
  Compass,
  Check,
  Award,
  AlertCircle,
  HelpCircle,
  FileText,
  Flame,
} from 'lucide-react';

interface ChallengeAssessmentProps {
  onNavigateToPeriodicTable: (element?: ChemicalElement) => void;
  onNavigateToAtom3D: (element: ChemicalElement) => void;
  onNavigateToTrends: () => void;
  onNavigateToCompare3: () => void;
  onNavigateToLab: () => void;
  onCloseAssessment?: () => void;
  selectedElement: ChemicalElement;
}

type ActiveView =
  | 'hub'
  | 'quiz'
  | 'quiz-result'
  | 'speed'
  | 'case-study';

export const ChallengeAssessment: React.FC<ChallengeAssessmentProps> = ({
  onNavigateToPeriodicTable,
  onNavigateToAtom3D,
  onNavigateToTrends,
  onNavigateToCompare3,
  onNavigateToLab,
  onCloseAssessment,
  selectedElement,
}) => {
  // Assessment history state from localStorage
  const [history, setHistory] = useState<AssessmentHistory>(() => loadAssessmentHistory());

  // Active view inside Challenge & Assessment
  const [activeView, setActiveView] = useState<ActiveView>('hub');

  // Currently active package for quiz mode
  const [activeTopic, setActiveTopic] = useState<AssessmentTopic>('struktur-atom');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quizUserAnswers, setQuizUserAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Speed challenge state
  const [speedTimeLeft, setSpeedTimeLeft] = useState<number>(60);
  const [speedIsRunning, setSpeedIsRunning] = useState<boolean>(false);
  const [speedScore, setSpeedScore] = useState<number>(0);
  const [speedQuestionIndex, setSpeedQuestionIndex] = useState<number>(0);
  const [speedFeedback, setSpeedFeedback] = useState<'correct' | 'wrong' | null>(null);
  const speedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Case study active mission
  const [activeMissionId, setActiveMissionId] = useState<string>('cs-1');
  const [missionAnswer, setMissionAnswer] = useState<number | null>(null);
  const [missionSubmitted, setMissionSubmitted] = useState<boolean>(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Speed Challenge Timer Effect
  useEffect(() => {
    if (speedIsRunning && speedTimeLeft > 0) {
      speedTimerRef.current = setTimeout(() => {
        setSpeedTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (speedTimeLeft === 0 && speedIsRunning) {
      setSpeedIsRunning(false);
      const updatedHistory = saveSpeedChallengeScore(speedScore, SPEED_CHALLENGE_BANK.length);
      setHistory(updatedHistory);
      showToast(`Waktu habis! Skor akhirmu: ${speedScore}`);
    }
    return () => {
      if (speedTimerRef.current) clearTimeout(speedTimerRef.current);
    };
  }, [speedIsRunning, speedTimeLeft, speedScore]);

  // Start package quiz
  const startPackageQuiz = (topic: AssessmentTopic) => {
    setActiveTopic(topic);
    setCurrentQuestionIndex(0);
    setQuizUserAnswers({});
    setShowExplanation(false);
    setActiveView('quiz');
  };

  // Handle quiz answer click
  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (quizUserAnswers[questionId] !== undefined) return; // locked once clicked
    setQuizUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setShowExplanation(true);
  };

  // Next question or finish
  const handleNextQuizQuestion = () => {
    const pkg = ASSESSMENT_PACKAGES[activeTopic];
    if (currentQuestionIndex < pkg.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowExplanation(quizUserAnswers[pkg.questions[currentQuestionIndex + 1].id] !== undefined);
    } else {
      // Calculate score and save
      let correctCount = 0;
      pkg.questions.forEach((q) => {
        if (quizUserAnswers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });
      const updated = savePackageScore(activeTopic, correctCount, pkg.questions.length, quizUserAnswers);
      setHistory(updated);
      setActiveView('quiz-result');
    }
  };

  // Start Speed Challenge
  const handleStartSpeedChallenge = () => {
    setSpeedScore(0);
    setSpeedQuestionIndex(0);
    setSpeedTimeLeft(60);
    setSpeedIsRunning(true);
    setSpeedFeedback(null);
    setActiveView('speed');
  };

  // Answer Speed Challenge item
  const handleSpeedAnswer = (optionIndex: number) => {
    if (!speedIsRunning) return;
    const currentItem = SPEED_CHALLENGE_BANK[speedQuestionIndex % SPEED_CHALLENGE_BANK.length];
    const isCorrect = optionIndex === currentItem.correctIndex;

    if (isCorrect) {
      setSpeedScore((prev) => prev + 1);
      setSpeedFeedback('correct');
    } else {
      setSpeedFeedback('wrong');
    }

    setTimeout(() => {
      setSpeedFeedback(null);
      setSpeedQuestionIndex((prev) => prev + 1);
    }, 350);
  };

  // Submit Mission Case Study
  const handleSubmitMission = (mission: CaseStudyMission) => {
    if (missionAnswer === null) return;
    setMissionSubmitted(true);
    if (missionAnswer === mission.correctIndex) {
      const updated = completeMission(mission.id);
      setHistory(updated);
      showToast('✓ Misi investigasi kasus berhasil diselesaikan!');
    }
  };

  // Helper to jump to related feature
  const handleOpenRelatedFeature = (feature: AssessmentQuestion['relatedFeature']) => {
    if (feature === 'table') {
      onNavigateToPeriodicTable();
    } else if (feature === 'atom3d') {
      onNavigateToAtom3D(selectedElement);
    } else if (feature === 'trends') {
      onNavigateToTrends();
    } else if (feature === 'compare3') {
      onNavigateToCompare3();
    } else if (feature === 'lab') {
      onNavigateToLab();
    }
  };

  const currentPkg = ASSESSMENT_PACKAGES[activeTopic];
  const currentQ = currentPkg.questions[currentQuestionIndex];
  const currentSpeedItem = SPEED_CHALLENGE_BANK[speedQuestionIndex % SPEED_CHALLENGE_BANK.length];
  const currentMission = CASE_STUDY_MISSIONS.find((m) => m.id === activeMissionId) || CASE_STUDY_MISSIONS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-cyan-950 border border-cyan-500/80 text-cyan-200 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/80 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>CHALLENGE & ASSESSMENT</span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase">
                  Phase 8
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Uji penguasaan konsep atom, hukum keperiodikan, perbandingan unsur, dan analisis laboratorium.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {activeView !== 'hub' && (
              <button
                type="button"
                onClick={() => {
                  setActiveView('hub');
                  setSpeedIsRunning(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Menu Asesmen</span>
              </button>
            )}
            {onCloseAssessment && (
              <button
                type="button"
                onClick={onCloseAssessment}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <span>Tabel Standar</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Stats Summary Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Kuis Selesai</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              {history.totalQuizzesTaken} kali
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Jawaban Benar</span>
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              {history.totalCorrectAnswers} soal
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Rekor Speed 60s</span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
              {history.speedChallengeBest ? `${history.speedChallengeBest.score} poin` : '0 poin'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Misi Kasus Tuntas</span>
            <span className="text-base sm:text-lg font-black text-purple-400 font-mono">
              {history.completedMissions.length} / {CASE_STUDY_MISSIONS.length}
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* VIEW 1: HUB / DASHBOARD                                              */}
      {/* ==================================================================== */}
      {activeView === 'hub' && (
        <div className="space-y-6">
          {/* Section A: 4 Thematic Assessment Packages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  Paket Asesmen & Uji Pemahaman
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Pilih topik evaluasi untuk menguji pemahaman
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(ASSESSMENT_PACKAGES) as AssessmentTopic[]).map((topicKey) => {
                const pkg = ASSESSMENT_PACKAGES[topicKey];
                const bestResult = history.packageResults[topicKey];

                return (
                  <div
                    key={pkg.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                          {pkg.shortTitle}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>~{pkg.estimatedMinutes} menit</span>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        {bestResult ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400 font-medium">Skor Terbaik:</span>
                            <span
                              className={`font-black font-mono px-2 py-0.5 rounded-md ${
                                bestResult.percentage >= 80
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-amber-950 text-amber-300'
                              }`}
                            >
                              {bestResult.score}/{bestResult.maxScore} ({bestResult.percentage}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {pkg.questionCount} Soal • Belum dikerjakan
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => startPackageQuiz(pkg.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <span>{bestResult ? 'Ulangi Kuis' : 'Mulai Kuis'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Speed Challenge & Case Study Missions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Speed Challenge Banner Card */}
            <div className="md:col-span-6 p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                      Mode Cepat
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    ⏱ 60 Detik
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white">
                  Speed Challenge: Tebak Unsur
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tantangan adu kecepatan mengenali simbol, nomor atom, dan sifat unsur dalam 60 detik. Latih refleks dan ketajaman ingatan tabel periodik!
                </p>

                {history.speedChallengeBest && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Rekor Tertinggi:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {history.speedChallengeBest.score} jawaban benar
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartSpeedChallenge}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Mulai Tantangan 60 Detik</span>
              </button>
            </div>

            {/* Case Study Missions Card */}
            <div className="md:col-span-6 p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                      Studi Kasus
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {history.completedMissions.length} Selesai
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white">
                  Misi Investigasi Laboratorium
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pecahkan skenario dan studi kasus sains nyata: identifikasi sampel meteorit misterius X dan bedah anomali reaktivitas di tabung reaksi.
                </p>

                <div className="mt-3 space-y-1.5">
                  {CASE_STUDY_MISSIONS.map((m) => {
                    const isDone = history.completedMissions.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300 font-medium truncate max-w-[200px]">
                          {m.title}
                        </span>
                        {isDone ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tuntas
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Belum</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveMissionId(CASE_STUDY_MISSIONS[0].id);
                  setMissionAnswer(null);
                  setMissionSubmitted(false);
                  setActiveView('case-study');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Buka Misi Investigasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 2: ACTIVE QUIZ SESSION                                          */}
      {/* ==================================================================== */}
      {activeView === 'quiz' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in duration-200">
          {/* Quiz Header & Progress Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentPkg.badgeColor}`}>
                  {currentPkg.shortTitle}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Soal {currentQuestionIndex + 1} dari {currentPkg.questions.length}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {currentQ.difficulty}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-1">
                {currentPkg.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('hub')}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Keluar Kuis
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{
                width: `${((currentQuestionIndex + 1) / currentPkg.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Box */}
          <div className="space-y-4">
            {currentQ.contextSnippet && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-cyan-300">
                📌 Konteks: {currentQ.contextSnippet}
              </div>
            )}

            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {currentQ.question}
            </p>

            {/* 4 Answer Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = quizUserAnswers[currentQ.id] === oIdx;
                const isAnswered = quizUserAnswers[currentQ.id] !== undefined;
                const isCorrectOption = oIdx === currentQ.correctIndex;

                let optStyle =
                  'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900/60';

                if (isAnswered) {
                  if (isCorrectOption) {
                    optStyle =
                      'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrectOption) {
                    optStyle =
                      'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                  } else {
                    optStyle = 'bg-slate-950/30 border-slate-850 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectQuizOption(currentQ.id, oIdx)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scientific Explanation Box (Pembahasan Mendalam) */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950/50 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                  Pembahasan Ilmiah:
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-cyan-300 font-medium">
                  💡 Tips Belajar: {currentQ.recommendationHint}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenRelatedFeature(currentQ.relatedFeature)}
                  className="self-end sm:self-auto flex items-center gap-1 text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                >
                  <span>Buka Fitur Ini</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-500 font-mono">
              {quizUserAnswers[currentQ.id] !== undefined
                ? 'Jawaban tersimpan'
                : 'Pilih salah satu jawaban di atas'}
            </span>

            <button
              type="button"
              disabled={quizUserAnswers[currentQ.id] === undefined}
              onClick={handleNextQuizQuestion}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer ${
                quizUserAnswers[currentQ.id] !== undefined
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <span>
                {currentQuestionIndex < currentPkg.questions.length - 1
                  ? 'Soal Selanjutnya'
                  : 'Lihat Hasil Evaluasi'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 3: QUIZ RESULT / EVALUATION REPORT                              */}
      {/* ==================================================================== */}
      {activeView === 'quiz-result' && (
        <div className="space-y-5 animate-in zoom-in-95 duration-200">
          {/* Result Score Card */}
          {(() => {
            let correct = 0;
            currentPkg.questions.forEach((q) => {
              if (quizUserAnswers[q.id] === q.correctIndex) correct++;
            });
            const pct = Math.round((correct / currentPkg.questions.length) * 100);

            let badgeTitle = 'Pakar Kimia Sempurna';
            let badgeColor = 'text-amber-400 bg-amber-950/80 border-amber-600';
            if (pct >= 80 && pct < 100) {
              badgeTitle = 'Sangat Mahir';
              badgeColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-600';
            } else if (pct >= 60 && pct < 80) {
              badgeTitle = 'Cukup Mahir';
              badgeColor = 'text-cyan-400 bg-cyan-950/80 border-cyan-600';
            } else if (pct < 60) {
              badgeTitle = 'Perlu Penguatan Konsep';
              badgeColor = 'text-rose-400 bg-rose-950/80 border-rose-600';
            }

            return (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-xl">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                  </div>
                </div>

                <div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColor}`}>
                    {badgeTitle}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                    Hasil Asesmen: {currentPkg.shortTitle}
                  </h2>
                  <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono mt-1">
                    {correct} / {currentPkg.questions.length}{' '}
                    <span className="text-lg text-slate-400">({pct}%)</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {pct === 100
                    ? 'Luar biasa! Kamu menguasai seluruh konsep pada paket ini dengan sempurna.'
                    : pct >= 80
                    ? 'Prestasi sangat baik! Pemahaman konsepmu sangat matang, tinggal menyempurnakan detail kecil.'
                    : 'Terus berlatih! Tinjau kembali pembahasan di bawah atau buka fitur ATOM 3D terkait untuk memperkuat konsep.'}
                </p>

                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => startPackageQuiz(activeTopic)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Paket Ini</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('hub')}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                  >
                    <span>Pilih Paket Asesmen Lain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Question by Question Detailed Review */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Tinjauan Seluruh Soal & Pembahasan</span>
            </h3>

            <div className="space-y-3">
              {currentPkg.questions.map((q, idx) => {
                const userChoice = quizUserAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold font-mono text-slate-400">
                        Soal #{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}
                      >
                        {isCorrect ? '✓ Benar' : '✕ Belum Tepat'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-white">
                      {q.question}
                    </p>

                    <div className="text-xs space-y-1">
                      <div className="p-2 rounded-lg bg-slate-950/60 text-slate-300">
                        <strong className="text-emerald-400">Kunci Benar: </strong>
                        {q.options[q.correctIndex]}
                      </div>
                      {!isCorrect && userChoice !== undefined && (
                        <div className="p-2 rounded-lg bg-rose-950/30 text-rose-300">
                          <strong>Pilihanmu: </strong>
                          {q.options[userChoice]}
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-300">Pembahasan: </strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 4: SPEED CHALLENGE (60s Time Attack)                            */}
      {/* ==================================================================== */}
      {activeView === 'speed' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Zap className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  SPEED CHALLENGE 60s
                </h2>
                <p className="text-xs text-slate-400">
                  Tebak simbol unsur secepat dan setepat mungkin!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer Pill */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 border border-amber-500/60 font-mono font-black text-base text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{speedTimeLeft}s</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSpeedIsRunning(false);
                  setActiveView('hub');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>

          {/* Current Score Ticker */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">
              Pertanyaan #{speedQuestionIndex + 1}
            </span>
            <span className="font-mono font-black text-emerald-400 text-base">
              Skor: {speedScore}
            </span>
          </div>

          {/* Active Question Clue Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-amber-500/50 text-center space-y-2 shadow-2xl relative overflow-hidden">
            {speedFeedback && (
              <div
                className={`absolute inset-0 flex items-center justify-center text-xl font-black z-20 backdrop-blur-xs animate-in zoom-in-50 duration-150 ${
                  speedFeedback === 'correct'
                    ? 'bg-emerald-950/80 text-emerald-300'
                    : 'bg-rose-950/80 text-rose-300'
                }`}
              >
                {speedFeedback === 'correct' ? '✓ TEPAT! +1' : '✕ SALAH!'}
              </div>
            )}

            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Petunjuk Unsur:
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              &quot;{currentSpeedItem.prompt}&quot;
            </h3>
            <p className="text-xs text-slate-400 italic">
              Petunjuk tambahan: {currentSpeedItem.hint}
            </p>
          </div>

          {/* 4 Large Symbol Tap Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentSpeedItem.options.map((sym, oIdx) => (
              <button
                key={`${sym}-${oIdx}`}
                type="button"
                disabled={!speedIsRunning}
                onClick={() => handleSpeedAnswer(oIdx)}
                className="h-20 sm:h-24 rounded-2xl bg-slate-950/80 border-2 border-slate-800 hover:border-amber-400 hover:bg-slate-900 text-2xl sm:text-3xl font-black text-white transition-all shadow-lg active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
              >
                <span className="group-hover:text-amber-300 transition-colors">
                  {sym}
                </span>
              </button>
            ))}
          </div>

          {/* Finished or Stopped */}
          {!speedIsRunning && speedTimeLeft === 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500 text-center space-y-3">
              <h4 className="text-lg font-black text-white">WAKTU 60 DETIK HABIS!</h4>
              <p className="text-xs text-slate-300">
                Kamu berhasil menjawab <strong className="text-amber-300">{speedScore}</strong> unsur dengan benar dalam 60 detik.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartSpeedChallenge}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  Main Lagi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('hub')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Kembali ke Menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 5: CASE STUDY INVESTIGATION MISSION                             */}
      {/* ==================================================================== */}
      {activeView === 'case-study' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Mission Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CASE_STUDY_MISSIONS.map((m) => {
              const isActive = m.id === activeMissionId;
              const isDone = history.completedMissions.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveMissionId(m.id);
                    setMissionAnswer(null);
                    setMissionSubmitted(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{m.title}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Mission Scenario Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                Skenario Investigasi Sains:
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {currentMission.title}
              </h2>
              <p className="text-xs text-slate-400 italic">
                {currentMission.subtitle}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentMission.scenario}
            </div>

            {/* Clues Box */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Petunjuk Data Lapangan:</span>
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {currentMission.clues.map((clue, idx) => (
                  <li key={idx}>{clue}</li>
                ))}
              </ul>
            </div>

            {/* Question & Options */}
            <div className="space-y-3 pt-2">
              <p className="text-xs sm:text-sm font-bold text-white">
                {currentMission.question}
              </p>

              <div className="space-y-2">
                {currentMission.options.map((opt, oIdx) => {
                  const isSelected = missionAnswer === oIdx;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={missionSubmitted}
                      onClick={() => setMissionAnswer(oIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-400 text-purple-200 ring-2 ring-purple-500/30'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submission / Outcome */}
            {!missionSubmitted ? (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={missionAnswer === null}
                  onClick={() => handleSubmitMission(currentMission)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    missionAnswer !== null
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>Kirim Jawaban Investigasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-purple-950/40 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  {missionAnswer === currentMission.correctIndex ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                  <h4 className="text-sm font-extrabold text-white">
                    {missionAnswer === currentMission.correctIndex
                      ? 'Analisis Tepat! Kasus Terpecahkan.'
                      : 'Hasil Investigasi Belum Tepat'}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentMission.explanation}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMissionSubmitted(false);
                      setMissionAnswer(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Coba Analisis Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('hub')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Kembali ke Menu Asesmen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
