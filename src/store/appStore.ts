// Central app state store using React context + localStorage
// Manages user profile, gamification, and cross-screen data

export interface UserProfile {
  name: string;
  grade: string;
  subjects: string[];
  location: 'Village' | 'Town' | 'City' | '';
  language: 'Hindi' | 'English';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt: number;
}

export interface AppState {
  // User profile
  profile: UserProfile;
  
  // Gamification
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  badges: Badge[];
  snapsCount: number;
  experimentsCount: number;
  
  // Cross-screen data (ephemeral per flow)
  capturedImage: string | null;        // For Snap & Learn flow
  snapLearnResult: SnapLearnResult | null;
  homeworkImage: string | null;        // For Homework Helper flow
  homeworkResult: HomeworkResult | null;
  diyExperiment: DIYExperiment | null; // For DIY flow
}

export interface SnapLearnResult {
  objectName: string;
  objectEmoji: string;
  friendGreeting: string;
  lessons: {
    biology?: SubjectLesson;
    chemistry?: SubjectLesson;
    physics?: SubjectLesson;
    localContext?: SubjectLesson;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  nextChallenge: {
    prompt: string;
    hint: string;
    concept: string;
  };
  xpEarned: number;
  badgeProgress: string;
}

export interface SubjectLesson {
  title: string;
  emoji: string;
  content: string;
  ncertChapter: string;
}

export interface HomeworkResult {
  questionRead: string;
  subject: string;
  chapter: string;
  friendIntro: string;
  steps: HomeworkStep[];
  relatedConcept?: {
    title: string;
    content: string;
    connectsTo: string;
  };
}

export interface HomeworkStep {
  stepNumber: number;
  hint: string;
  concept: string;
  isRevealed: boolean;
  formula?: string;
}

export interface DIYExperiment {
  detectedItems: string[];
  experimentTitle: string;
  friendMessage: string;
  conceptConnection: string;
  difficulty: string;
  timeMinutes: number;
  steps: DIYStep[];
  conceptSummary: string;
  badge: string;
  xpEarned: number;
}

export interface DIYStep {
  stepNumber: number;
  instruction: string;
  cameraAction: string;
  expectedObservation: string;
  friendComment: string;
}

const STORAGE_KEY = 'snaplearn-state';

const DEFAULT_STATE: AppState = {
  profile: { name: '', grade: '', subjects: [], location: '', language: 'Hindi' },
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  badges: [],
  snapsCount: 0,
  experimentsCount: 0,
  capturedImage: null,
  snapLearnResult: null,
  homeworkImage: null,
  homeworkResult: null,
  diyExperiment: null,
};

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

export function saveState(state: Partial<AppState>) {
  try {
    const current = loadState();
    const merged = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

// XP & Level utilities
export const LEVEL_THRESHOLDS = [0, 1000, 2500, 5000, 10000];
export const LEVEL_NAMES = ['Curious Learner', 'Village Explorer', 'Junior Scientist', 'Senior Scientist', 'SnapLearn Master'];

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPToNextLevel(xp: number): { current: number; needed: number; levelXP: number } {
  const level = getLevelFromXP(xp);
  if (level >= LEVEL_THRESHOLDS.length) return { current: xp, needed: xp, levelXP: xp };
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  return {
    current: xp - currentThreshold,
    needed: nextThreshold - currentThreshold,
    levelXP: xp - currentThreshold,
  };
}

export function addXP(amount: number): { newXP: number; newLevel: number; levelUp: boolean } {
  const state = loadState();
  const newXP = state.xp + amount;
  const oldLevel = getLevelFromXP(state.xp);
  const newLevel = getLevelFromXP(newXP);
  saveState({ xp: newXP, level: newLevel });
  return { newXP, newLevel, levelUp: newLevel > oldLevel };
}

export function updateStreak(): number {
  const state = loadState();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  let newStreak = state.streak;
  if (state.lastActiveDate === yesterday) {
    newStreak = state.streak + 1;
  } else if (state.lastActiveDate !== today) {
    newStreak = 1;
  }
  
  saveState({ streak: newStreak, lastActiveDate: today });
  return newStreak;
}

export const BADGES_CONFIG = [
  { id: 'first_snap', title: 'Pehli Nazar 👀', emoji: '👀', description: 'Pehli photo li!', trigger: (s: AppState) => s.snapsCount >= 1 },
  { id: 'village_scientist', title: 'Village Scientist 🌿', emoji: '🌿', description: '5 objects discovered!', trigger: (s: AppState) => s.snapsCount >= 5 },
  { id: 'kitchen_chemist', title: 'Kitchen Chemist 🧪', emoji: '🧪', description: 'First DIY experiment done!', trigger: (s: AppState) => s.experimentsCount >= 1 },
  { id: 'week_warrior', title: 'Week Warrior 🔥', emoji: '🔥', description: '7 day streak!', trigger: (s: AppState) => s.streak >= 7 },
];

export function checkAndUnlockBadges(): Badge[] {
  const state = loadState();
  const newBadges: Badge[] = [];
  
  for (const config of BADGES_CONFIG) {
    if (config.trigger(state) && !state.badges.find(b => b.id === config.id)) {
      const badge: Badge = {
        id: config.id,
        title: config.title,
        description: config.description,
        emoji: config.emoji,
        unlockedAt: Date.now(),
      };
      newBadges.push(badge);
    }
  }
  
  if (newBadges.length > 0) {
    saveState({ badges: [...state.badges, ...newBadges] });
  }
  
  return newBadges;
}
