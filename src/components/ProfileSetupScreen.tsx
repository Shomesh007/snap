import React from 'react';
import { UserProfile } from '../types';
import { Rocket, MapPin, Sparkles, PartyPopper } from 'lucide-react';

interface Props {
  onNext: () => void;
  onBack: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const locations = ['Village', 'Town', 'City'] as const;

export default function ProfileSetupScreen({ onNext, profile, setProfile }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="pt-14 px-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Step 3 of 3</span>
          <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Final Setup</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-full rounded-full"></div>
        </div>
      </div>

      <main className="flex-1 flex flex-col px-8 pt-10 pb-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-[32px] leading-tight font-extrabold">
              Last step yaar!<br/>Almost done 🎉
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              Kahaan se ho? <MapPin className="w-3 h-3 text-primary" />
            </p>
            <div className="flex gap-3">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setProfile({ ...profile, location: loc })}
                  className={`flex-1 py-3 px-2 rounded-2xl border-2 transition-all ${
                    profile.location === loc
                      ? 'border-primary bg-primary/10 snap-green-glow text-primary'
                      : 'border-slate-800 bg-slate-800/30 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold block">{loc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Aapka Naam</p>
            <div className="relative">
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-transparent border-0 border-b-2 border-slate-700 focus:border-primary focus:ring-0 text-xl py-4 px-0 placeholder:text-slate-600 font-medium transition-colors"
                placeholder="Tera naam? 👋"
              />
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="relative py-6">
          <div className="absolute -top-4 left-4 opacity-50">
            <PartyPopper className="text-primary w-6 h-6" />
          </div>
          <div className="absolute top-2 right-8 opacity-40">
            <Sparkles className="text-snap-orange w-5 h-5 rotate-45" />
          </div>
          
          <button 
            onClick={onNext}
            disabled={!profile.name || !profile.location}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
              profile.name && profile.location
                ? 'bg-snap-orange snap-orange-glow hover:brightness-110 active:scale-[0.98]'
                : 'bg-slate-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="font-body text-xl font-bold text-white tracking-normal">SnapLearn Shuru Karo!</span>
            <Rocket className="text-white w-6 h-6" />
          </button>
          <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.2em] mt-6">
            Ready to crush your goals? Let's go!
          </p>
        </div>
      </main>
    </div>
  );
}
