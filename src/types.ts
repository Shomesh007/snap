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
  | 'deep-explain';

export interface UserProfile {
  name: string;
  grade: string;
  subjects: string[];
  location: 'Village' | 'Town' | 'City' | '';
  language: 'Hindi' | 'English';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  type?: 'text' | 'audio' | 'image';
  dataUrl?: string;
  timestamp: Date;
}
