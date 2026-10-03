import { loadLearningJourneyProgress, calculateJourneySummary } from './learning-journey-storage';
import { loadAssessmentHistory } from './assessment-storage';

export interface LearningActivityItem {
  id: string;
  type:
    | 'element'
    | 'atom3d'
    | 'ar'
    | 'trend'
    | 'compare3'
    | 'lab'
    | 'challenge'
    | 'reflection'
    | 'journey';
  title: string;
  timestamp: string; // ISO string
  metadata?: Record<string, unknown>;
}

export interface ComparisonRecord {
  elements: string[]; // e.g. ['Na', 'Mg', 'Cl']
  timestamp: string;
  property?: string;
}

export interface LabExperimentRecord {
  id: string;
  name: string;
  timestamp: string;
  materials?: string[];
}

export interface ARSessionRecord {
  symbol: string;
  name: string;
  timestamp: string;
}

export interface ChallengeStats {
  totalAnswered: number;
  correct: number;
  incorrect: number;
  quizzesTaken: number;
  missionsCompleted: number;
  speedBestScore?: number;
}

export interface LearningProgressData {
  version: number;
  exploredElements: string[]; // symbols
  atom3dElements: string[];   // symbols
  arSessions: ARSessionRecord[];
  trendsExplored: string[];   // property keys
  comparisons: ComparisonRecord[];
  labExperiments: LabExperimentRecord[];
  challenges: ChallengeStats;
  learningJourney: {
    understandingDone: number;
    applicationDone: number;
    reflectionsCount: number;
    summaryPercentage: number;
  };
  reflections: Record<string, string>;
  activities: LearningActivityItem[];
  lastUpdated: number;
}

export const STORAGE_KEY_PROGRESS = 'atom3d_learning_progress_v1';

export const INITIAL_PROGRESS_DATA: LearningProgressData = {
  version: 1,
  exploredElements: [],
  atom3dElements: [],
  arSessions: [],
  trendsExplored: [],
  comparisons: [],
  labExperiments: [],
  challenges: {
    totalAnswered: 0,
    correct: 0,
    incorrect: 0,
    quizzesTaken: 0,
    missionsCompleted: 0,
  },
  learningJourney: {
    understandingDone: 0,
    applicationDone: 0,
    reflectionsCount: 0,
    summaryPercentage: 0,
  },
  reflections: {},
  activities: [],
  lastUpdated: Date.now(),
};

/**
 * Synchronize and load learning progress by merging direct tracks with Phase 7 & 8 storage.
 */
export function loadLearningProgress(): LearningProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    let current: LearningProgressData = raw ? JSON.parse(raw) : { ...INITIAL_PROGRESS_DATA };

    // Synchronize with Phase 7 Learning Journey
    const journey = loadLearningJourneyProgress();
    const journeySummary = calculateJourneySummary(journey);
    const reflectionKeys = Object.keys(journey.reflectionAnswers || {}).filter(
      (k) => (journey.reflectionAnswers[k] || '').trim().length > 0
    );

    // Synchronize with Phase 8 Assessment History
    const assessment = loadAssessmentHistory();
    let totalQuizAnswered = 0;
    let totalQuizCorrect = 0;

    Object.values(assessment.packageResults || {}).forEach((res) => {
      if (res) {
        totalQuizAnswered += res.maxScore || 0;
        totalQuizCorrect += res.score || 0;
      }
    });

    const totalAnswered = totalQuizAnswered;
    const correct = totalQuizCorrect;
    const incorrect = Math.max(0, totalAnswered - correct);

    current = {
      ...current,
      version: 1,
      exploredElements: Array.isArray(current.exploredElements) ? current.exploredElements : [],
      atom3dElements: Array.isArray(current.atom3dElements) ? current.atom3dElements : [],
      arSessions: Array.isArray(current.arSessions) ? current.arSessions : [],
      trendsExplored: Array.isArray(current.trendsExplored) ? current.trendsExplored : [],
      comparisons: Array.isArray(current.comparisons) ? current.comparisons : [],
      labExperiments: Array.isArray(current.labExperiments) ? current.labExperiments : [],
      challenges: {
        totalAnswered,
        correct,
        incorrect,
        quizzesTaken: assessment.totalQuizzesTaken || 0,
        missionsCompleted: (assessment.completedMissions || []).length,
        speedBestScore: assessment.speedChallengeBest?.score,
      },
      learningJourney: {
        understandingDone: journey.understandingCompleted?.length || 0,
        applicationDone: journey.applicationCompleted?.length || 0,
        reflectionsCount: reflectionKeys.length,
        summaryPercentage: journeySummary.percentage || 0,
      },
      reflections: journey.reflectionAnswers || current.reflections || {},
      activities: Array.isArray(current.activities) ? current.activities : [],
      lastUpdated: current.lastUpdated || Date.now(),
    };

    return current;
  } catch (e) {
    console.warn('Failed to load learning progress', e);
    return { ...INITIAL_PROGRESS_DATA };
  }
}

/**
 * Save progress data to localStorage
 */
export function saveLearningProgress(data: LearningProgressData): void {
  try {
    const updated = {
      ...data,
      version: 1,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save learning progress to localStorage', e);
  }
}

/**
 * Helper to record a new activity item (keeps max 30 items)
 */
function recordActivityItem(
  activities: LearningActivityItem[],
  item: Omit<LearningActivityItem, 'id' | 'timestamp'>
): LearningActivityItem[] {
  const newItem: LearningActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ...item,
  };

  // Avoid recording identical activity within the last 10 seconds
  if (activities.length > 0) {
    const latest = activities[0];
    if (latest.type === item.type && latest.title === item.title) {
      const diffMs = Date.now() - new Date(latest.timestamp).getTime();
      if (diffMs < 10000) {
        return activities;
      }
    }
  }

  return [newItem, ...activities].slice(0, 30);
}

/**
 * Event Tracker: Element Explored
 */
export function trackElementExplored(symbol: string, name: string): LearningProgressData {
  const data = loadLearningProgress();
  const already = data.exploredElements.includes(symbol);
  const updatedExplored = already ? data.exploredElements : [...data.exploredElements, symbol];

  const updatedActivities = recordActivityItem(data.activities, {
    type: 'element',
    title: `Mengeksplorasi ${name} (${symbol})`,
    metadata: { symbol, name },
  });

  const updated: LearningProgressData = {
    ...data,
    exploredElements: updatedExplored,
    activities: updatedActivities,
  };
  saveLearningProgress(updated);
  return updated;
}

/**
 * Event Tracker: Atom 3D Observed
 */
export function trackAtom3DViewed(symbol: string, name: string): LearningProgressData {
  const data = loadLearningProgress();
  const already = data.atom3dElements.includes(symbol);
  const updated3D = already ? data.atom3dElements : [...data.atom3dElements, symbol];

  const updatedActivities = recordActivityItem(data.activities, {
    type: 'atom3d',
    title: `Mengamati Atom 3D ${name} (${symbol})`,
    metadata: { symbol, name },
  });

  const updated: LearningProgressData = {
    ...data,
    atom3dElements: updated3D,
    activities: updatedActivities,
  };
  saveLearningProgress(updated);
  return updated;
}

/**
 * Event Tracker: AR Started
 */
export function trackARStarted(symbol: string, name: string): LearningProgressData {
  const data = loadLearningProgress();
  const newSession: ARSessionRecord = {
    symbol,
    name,
    timestamp: new Date().toISOString(),
  };

  const updatedActivities = recordActivityItem(data.activities, {
    type: 'ar',
    title: `Mencoba Augmented Reality ${name} (${symbol})`,
    metadata: { symbol, name },
  });

  const updated: LearningProgressData = {
    ...data,
    arSessions: [newSession, ...data.arSessions].slice(0, 50),
    activities: updatedActivities,
  };
  saveLearningProgress(updated);
  return updated;
}

/**
 * Event Tracker: Periodic Trend Explored
 */
export function trackTrendExplored(propertyKey: string, propertyName: string): LearningProgressData {
  const data = loadLearningProgress();
  const already = data.trendsExplored.includes(propertyKey);
  const updatedTrends = already ? data.trendsExplored : [...data.trendsExplored, propertyKey];

  let updatedActivities = data.activities;
  if (!already) {
    updatedActivities = recordActivityItem(data.activities, {
      type: 'trend',
      title: `Mengeksplorasi Sifat ${propertyName}`,
      metadata: { propertyKey, propertyName },
    });
  }

  const updated: LearningProgressData = {
    ...data,
    trendsExplored: updatedTrends,
    activities: updatedActivities,
  };
  saveLearningProgress(updated);
  return updated;
}

/**
 * Event Tracker: 3 Elements Compared
 */
export function trackCompare3Elements(
  elements: string[],
  names: string[],
  property?: string
): LearningProgressData {
  const data = loadLearningProgress();
  const record: ComparisonRecord = {
    elements,
    timestamp: new Date().toISOString(),
    property,
  };

  const updatedActivities = recordActivityItem(data.activities, {
    type: 'compare3',
    title: `Membandingkan 3 Unsur: ${elements.join(' — ')}`,
    metadata: { elements, names, property },
  });

  const updated: LearningProgressData = {
    ...data,
    comparisons: [record, ...data.comparisons].slice(0, 30),
    activities: updatedActivities,
  };
  saveLearningProgress(updated);
  return updated;
}

/**
 * Event Tracker: Chemistry Lab Experiment Conducted
 */
export function trackLabExperiment(
  id: string,
  name: string,
  materials?: string[]
): LearningProgressData {
  const data = loadLearningProgress();
  const exists = data.labExperiments.some((e) => e.id === id);

  const newRecord: LabExperimentRecord = {
    id,
    name,
    timestamp: new Date().toISOString(),
    materials,
  };

  const updatedExperiments = exists
    ? data.labExperiments.map((e) => (e.id === id ? newRecord : e))
    : [...data.labExperiments, newRecord];

  const updatedActivities = recordActivityItem(data.activities, {
    type: 'lab',
    title: `Melakukan Eksperimen ${name}`,
    metadata: { id, name, materials },
  });

  const updated: LearningProgressData = {
    ...data,
    labExperiments: updatedExperiments,
    activities: updatedActivities,
  };
  saveLearningProgress(updated);
  return updated;
}

/**
 * Clear learning progress completely (User Reset)
 */
export function resetLearningProgress(): LearningProgressData {
  try {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
  } catch (e) {
    console.warn('Failed to clear learning progress', e);
  }
  return { ...INITIAL_PROGRESS_DATA };
}

/**
 * Validate imported progress JSON
 */
export function validateImportedProgress(obj: unknown): obj is LearningProgressData {
  if (!obj || typeof obj !== 'object') return false;
  const target = obj as Record<string, unknown>;

  if (typeof target.version !== 'number') return false;
  if (!Array.isArray(target.exploredElements)) return false;
  if (!Array.isArray(target.atom3dElements)) return false;
  if (!Array.isArray(target.arSessions)) return false;
  if (!Array.isArray(target.trendsExplored)) return false;
  if (!Array.isArray(target.comparisons)) return false;
  if (!Array.isArray(target.labExperiments)) return false;
  if (!target.challenges || typeof target.challenges !== 'object') return false;
  if (!Array.isArray(target.activities)) return false;

  return true;
}
