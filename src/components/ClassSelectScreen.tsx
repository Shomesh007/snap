import React from 'react';
import { UserProfile } from '../types';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface Props {
  onNext: () => void;
  onBack: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const classes = ['6', '7', '8', '9', '10', '11', '12'];

export default function ClassSelectScreen({ onNext, profile, setProfile }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="pt-14 px-6">
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/4 rounded-full"></div>
        </div>
      </div>

      <header className="px-8 pt-10 pb-6">
        <h1 className="font-display text-3xl font-bold leading-tight mb-3">
          Tu kaunsi class mein hai? 📚
        </h1>
        <p className="font-body text-slate-400 text-base leading-relaxed">
          Main lessons waisi banaunga jo teri class ke liye sahi ho!
        </p>
      </header>

      <main className="flex-grow px-8 pb-32 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {classes.map((cls) => (
            <button
              key={cls}
              onClick={() => setProfile({ ...profile, grade: cls })}
              className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-2 ${
                profile.grade === cls
                  ? 'bg-primary/10 border-primary snap-green-glow scale-105 relative z-10'
                  : 'bg-slate-800/40 border-slate-700/50'
              }`}
            >
              <span className={`font-display text-4xl ${profile.grade === cls ? 'text-primary' : 'text-slate-300'}`}>{cls}</span>
              <span className={`font-body text-xs uppercase tracking-widest font-bold ${profile.grade === cls ? 'text-primary' : 'text-slate-500'}`}>Class</span>
              {profile.grade === cls && (
                <div className="absolute -top-2 -right-2 bg-primary text-background-dark rounded-full p-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
        <div className="flex flex-col gap-6">
          <button 
            onClick={onNext}
            disabled={!profile.grade}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all ${
              profile.grade 
                ? 'bg-snap-orange shadow-snap-orange/25 hover:brightness-110 active:scale-[0.98]' 
                : 'bg-slate-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="font-body text-xl font-bold text-white tracking-normal">Shuru Karo</span>
            <ArrowRight className="text-white w-6 h-6" />
          </button>
          <div className="flex justify-end">
            <button 
              onClick={onNext}
              className="font-mono text-slate-500 text-sm uppercase tracking-widest flex items-center gap-1 px-4 py-2"
            >
              Skip
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
