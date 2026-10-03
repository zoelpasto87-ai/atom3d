import { AssessmentTopic } from '../data/assessment-challenge-data';

export interface PackageResult {
  topic: AssessmentTopic;
  score: number;
  maxScore: number;
  percentage: number;
  timestamp: number;
  userAnswers: Record<string, number>; // questionId -> chosenIndex
}

export interface AssessmentHistory {
  packageResults: Partial<Record<AssessmentTopic, PackageResult>>;
  speedChallengeBest?: {
    score: number;
    total: number;
    timestamp: number;
  };
  completedMissions: string[];
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
}

const STORAGE_KEY = 'atom3d_assessment_history_v1';

export const INITIAL_ASSESSMENT_HISTORY: AssessmentHistory = {
  packageResults: {},
  completedMissions: [],
  totalQuizzesTaken: 0,
  totalCorrectAnswers: 0,
};

export function loadAssessmentHistory(): AssessmentHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_ASSESSMENT_HISTORY };
    const parsed = JSON.parse(raw);
    return {
      packageResults: parsed.packageResults || {},
      speedChallengeBest: parsed.speedChallengeBest,
      completedMissions: Array.isArray(parsed.completedMissions)
        ? parsed.completedMissions
        : [],
      totalQuizzesTaken: Number(parsed.totalQuizzesTaken) || 0,
      totalCorrectAnswers: Number(parsed.totalCorrectAnswers) || 0,
    };
  } catch (e) {
    console.warn('Failed to load assessment history from localStorage', e);
    return { ...INITIAL_ASSESSMENT_HISTORY };
  }
}

export function saveAssessmentHistory(history: AssessmentHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save assessment history to localStorage', e);
  }
}

export function savePackageScore(
  topic: AssessmentTopic,
  score: number,
  maxScore: number,
  userAnswers: Record<string, number>
): AssessmentHistory {
  const current = loadAssessmentHistory();
  const percentage = Math.round((score / maxScore) * 100);

  const prevBest = current.packageResults[topic]?.percentage ?? -1;
  const isBetterOrEqual = percentage >= prevBest;

  const updated: AssessmentHistory = {
    ...current,
    totalQuizzesTaken: current.totalQuizzesTaken + 1,
    totalCorrectAnswers: current.totalCorrectAnswers + score,
    packageResults: {
      ...current.packageResults,
      [topic]: isBetterOrEqual
        ? {
            topic,
            score,
            maxScore,
            percentage,
            timestamp: Date.now(),
            userAnswers,
          }
        : current.packageResults[topic]!,
    },
  };

  saveAssessmentHistory(updated);
  return updated;
}

export function saveSpeedChallengeScore(score: number, total: number): AssessmentHistory {
  const current = loadAssessmentHistory();
  const currentBest = current.speedChallengeBest?.score ?? -1;

  const updated: AssessmentHistory = {
    ...current,
    speedChallengeBest:
      score >= currentBest
        ? {
            score,
            total,
            timestamp: Date.now(),
          }
        : current.speedChallengeBest,
  };

  saveAssessmentHistory(updated);
  return updated;
}

export function completeMission(missionId: string): AssessmentHistory {
  const current = loadAssessmentHistory();
  if (current.completedMissions.includes(missionId)) {
    return current;
  }
  const updated: AssessmentHistory = {
    ...current,
    completedMissions: [...current.completedMissions, missionId],
  };
  saveAssessmentHistory(updated);
  return updated;
}

export function clearAssessmentHistory(): AssessmentHistory {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear assessment history', e);
  }
  return { ...INITIAL_ASSESSMENT_HISTORY };
}
