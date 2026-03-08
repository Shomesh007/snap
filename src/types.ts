// Re-export shared types from store for backwards compatibility
export type { UserProfile, Badge, AppState, SnapLearnResult, HomeworkResult, DIYExperiment } from './store/appStore';

// Screen navigation type - all screens in the app
export type Screen =
  | 'welcome'
  | 'class-select'
  | 'subject-select'
  | 'profile-setup'
  | 'home'
  | 'voice-overlay'
  | 'chat'
  | 'camera'
  | 'processing'
  | 'analysis'
  | 'diy-picker'
  | 'diy-scan'
  | 'diy-step'
  | 'success'
  | 'homework-capture'
  | 'homework-solution'
  | 'deep-explain'
  | 'live-learning'
  | 'exam-predictor'
  | 'profile'
  | 'discovery-challenge'
  | 'discovery-processing'
  | 'discovery-reveal';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  type?: 'text' | 'audio' | 'image';
  dataUrl?: string;
  timestamp: Date;
}

export interface DIYExperimentConfig {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time: number;
  emoji: string;
  concept: string;
  description: string;
}
