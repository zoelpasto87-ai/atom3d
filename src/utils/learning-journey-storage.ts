export interface LearningJourneyProgress {
  // Activity IDs completed in Section 1 (und-1, und-2, und-3, und-4)
  understandingCompleted: string[];
  // Interactive checklist in und-2
  understandingChecklist: Record<string, boolean>;
  // Selected element in und-1 if user picked one
  selectedElementNumber?: number;

  // Challenge IDs completed in Section 2 (app-1, app-2, app-3, app-4, app-5, app-6)
  applicationCompleted: string[];
  // User answers for challenges: challengeId -> optionIndex
  applicationAnswers: Record<string, number>;
  // Optional prediction for app-5
  applicationPredictions?: Record<string, number>;

  // User free-text reflection answers: questionId -> text
  reflectionAnswers: Record<string, string>;
  // Saved timestamp
  lastUpdated?: number;
}

const STORAGE_KEY = 'atom3d_learning_journey_v1';

export const INITIAL_JOURNEY_PROGRESS: LearningJourneyProgress = {
  understandingCompleted: [],
  understandingChecklist: {},
  applicationCompleted: [],
  applicationAnswers: {},
  applicationPredictions: {},
  reflectionAnswers: {},
};

export function loadLearningJourneyProgress(): LearningJourneyProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_JOURNEY_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      understandingCompleted: Array.isArray(parsed.understandingCompleted)
        ? parsed.understandingCompleted
        : [],
      understandingChecklist: parsed.understandingChecklist || {},
      selectedElementNumber: parsed.selectedElementNumber,
      applicationCompleted: Array.isArray(parsed.applicationCompleted)
        ? parsed.applicationCompleted
        : [],
      applicationAnswers: parsed.applicationAnswers || {},
      applicationPredictions: parsed.applicationPredictions || {},
      reflectionAnswers: parsed.reflectionAnswers || {},
      lastUpdated: parsed.lastUpdated,
    };
  } catch (e) {
    console.warn('Failed to load learning journey progress from localStorage', e);
    return { ...INITIAL_JOURNEY_PROGRESS };
  }
}

export function saveLearningJourneyProgress(progress: LearningJourneyProgress): void {
  try {
    const updated = {
      ...progress,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save learning journey progress to localStorage', e);
  }
}

export function clearLearningJourneyProgress(): LearningJourneyProgress {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear learning journey progress', e);
  }
  return { ...INITIAL_JOURNEY_PROGRESS };
}

export interface ProgressSummary {
  understandingCount: number;
  understandingTotal: number;
  isUnderstandingComplete: boolean;

  applicationCount: number;
  applicationTotal: number;
  isApplicationComplete: boolean;

  reflectionCount: number;
  reflectionTotal: number;
  isReflectionComplete: boolean;

  completedSectionsCount: number;
  percentage: 0 | 33 | 66 | 100;
  isAllComplete: boolean;
}

export function calculateJourneySummary(progress: LearningJourneyProgress): ProgressSummary {
  const undCount = progress.understandingCompleted.length;
  const undTotal = 4;
  const isUnderstandingComplete = undCount >= undTotal;

  const appCount = progress.applicationCompleted.length;
  const appTotal = 6;
  const isApplicationComplete = appCount >= appTotal;

  // Reflection counts non-empty answers (> 5 chars)
  const refCount = Object.values(progress.reflectionAnswers).filter(
    (text) => text && text.trim().length > 3
  ).length;
  const refTotal = 5;
  const isReflectionComplete = refCount >= refTotal;

  let completedSectionsCount = 0;
  if (isUnderstandingComplete) completedSectionsCount++;
  if (isApplicationComplete) completedSectionsCount++;
  if (isReflectionComplete) completedSectionsCount++;

  let percentage: 0 | 33 | 66 | 100 = 0;
  if (completedSectionsCount === 1) percentage = 33;
  else if (completedSectionsCount === 2) percentage = 66;
  else if (completedSectionsCount === 3) percentage = 100;

  return {
    understandingCount: undCount,
    understandingTotal: undTotal,
    isUnderstandingComplete,

    applicationCount: appCount,
    applicationTotal: appTotal,
    isApplicationComplete,

    reflectionCount: refCount,
    reflectionTotal: refTotal,
    isReflectionComplete,

    completedSectionsCount,
    percentage,
    isAllComplete: completedSectionsCount === 3,
  };
}
