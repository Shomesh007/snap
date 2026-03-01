import React from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Check } from 'lucide-react';

interface Props {
  onNext: () => void;
  onBack: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const subjects = [
  { name: 'Math', icon: '➕' },
  { name: 'Science', icon: '🔬' },
  { name: 'Hindi', icon: '📖' },
  { name: 'English', icon: '🗣️' },
  { name: 'Social Studies', icon: '🗺️', fullWidth: true },
];

export default function SubjectSelectScreen({ onNext, profile, setProfile }: Props) {
  const toggleSubject = (name: string) => {
    const newSubjects = profile.subjects.includes(name)
      ? profile.subjects.filter(s => s !== name)
      : [...profile.subjects, name];
    setProfile({ ...profile, subjects: newSubjects });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="pt-14 px-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Step 2 of 3</span>
          <span className="text-xs font-bold text-snap-orange uppercase tracking-widest">Almost there!</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-snap-orange w-2/3 rounded-full"></div>
        </div>
      </header>

      <main className="flex-1 px-8 pt-6 pb-24 overflow-y-auto no-scrollbar">
        <div className="space-y-2 mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight leading-tight">
            Kaun sa subject mushkil lagta hai? 🤔
          </h1>
          <p className="font-body text-base text-slate-400">
            Koi baat nahi — usi se shuru karte hain!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {subjects.map((sub) => (
            <button
              key={sub.name}
              onClick={() => toggleSubject(sub.name)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all ${
                sub.fullWidth ? 'col-span-2' : ''
              } ${
                profile.subjects.includes(sub.name)
                  ? 'border-snap-orange bg-snap-orange/10 snap-orange-glow'
                  : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              {profile.subjects.includes(sub.name) && (
                <div className="absolute top-3 right-3 bg-snap-orange rounded-full p-0.5">
                  <Check className="text-white w-4 h-4 font-bold" />
                </div>
              )}
              <span className="text-4xl mb-3">{sub.icon}</span>
              <span className={`font-bold text-lg ${profile.subjects.includes(sub.name) ? 'text-white' : 'text-slate-300'}`}>
                {sub.name}
              </span>
            </button>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
        <div className="max-w-md mx-auto space-y-4">
          <button 
            onClick={onNext}
            disabled={profile.subjects.length === 0}
            className={`w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 shadow-lg transition-all ${
              profile.subjects.length > 0
                ? 'bg-snap-orange snap-orange-glow hover:brightness-110 active:scale-[0.98]'
                : 'bg-slate-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="font-bold text-white text-lg tracking-wide">Shuru Karo</span>
            <ArrowRight className="text-white w-6 h-6" />
          </button>
          <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            Select at least 1 subject to continue
          </p>
        </div>
      </footer>
    </div>
  );
}
