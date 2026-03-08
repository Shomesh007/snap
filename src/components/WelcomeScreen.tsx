import React from 'react';
import { UserProfile } from '../types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onNext: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function WelcomeScreen({ onNext, profile, setProfile }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[40vh] relative w-full overflow-hidden bg-gradient-to-br from-orange-600 via-orange-900 to-background-dark">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-orange-900/20 to-transparent"></div>
      </div>

      <main className="flex-1 bg-background-dark rounded-t-[3rem] -mt-12 relative z-10 flex flex-col px-8 pt-10 pb-12 justify-between border-t border-slate-800 shadow-2xl">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              Namaste! 🙏
            </h1>
            <p className="font-body text-lg text-slate-300 leading-relaxed">
              SnapLearn mein aapka swagat hai — tera apna <span className="text-primary font-bold">AI yaar</span> jo science ko super easy banata hai!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Choose Language</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setProfile({ ...profile, language: 'Hindi' })}
                className={`flex-1 py-3 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 ${
                  profile.language === 'Hindi' 
                    ? 'border-primary snap-green-glow bg-primary/10 text-primary' 
                    : 'border-slate-800 bg-slate-800/30 text-slate-400'
                }`}
              >
                <span className="text-lg font-bold font-body">हिंदी</span>
                {profile.language === 'Hindi' && <CheckCircle2 className="w-4 h-4 fill-primary text-background-dark" />}
              </button>
              <button 
                onClick={() => setProfile({ ...profile, language: 'English' })}
                className={`flex-1 py-3 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 ${
                  profile.language === 'English' 
                    ? 'border-primary snap-green-glow bg-primary/10 text-primary' 
                    : 'border-slate-800 bg-slate-800/30 text-slate-400'
                }`}
              >
                <span className="text-lg font-bold font-body">English</span>
                {profile.language === 'English' && <CheckCircle2 className="w-4 h-4 fill-primary text-background-dark" />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onNext}
            className="w-full bg-snap-orange hover:brightness-110 active:scale-[0.98] transition-all py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-snap-orange/25"
          >
            <span className="font-body text-xl font-bold text-white tracking-tight">Shuru Karo</span>
            <ArrowRight className="text-white w-6 h-6" />
          </button>
          <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            By continuing, you agree to our Terms
          </p>
        </div>
      </main>
    </div>
  );
}
