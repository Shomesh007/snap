import React from 'react';
import { UserProfile, Screen } from '../types';
import { 
  Bell, 
  Flame, 
  Mic, 
  Camera, 
  FlaskConical, 
  BookOpen, 
  Video, 
  Home, 
  Library, 
  Plus, 
  Trophy, 
  User,
  ChevronRight,
  Calculator,
  Beaker
} from 'lucide-react';

interface Props {
  navigate: (screen: Screen) => void;
  profile: UserProfile;
}

export default function HomeScreen({ navigate, profile }: Props) {
  return (
    <div className="flex flex-col h-full bg-deep-navy text-slate-100 pb-28">
      <header className="flex items-center justify-between p-5 sticky top-0 bg-deep-navy/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-gradient-to-tr from-snap-green to-emerald-400 flex items-center justify-center p-[2px]">
            <div className="bg-deep-navy rounded-full w-full h-full flex items-center justify-center overflow-hidden">
              <span className="text-snap-green font-display text-xl">{profile.name[0] || 'P'}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-display font-bold leading-tight">Namaste, {profile.name || 'Priya'}! 👋</h2>
            <div className="flex items-center gap-1.5">
              <Flame className="text-snap-green w-4 h-4 fill-current" />
              <span className="text-snap-green text-xs font-bold tracking-wide uppercase">5 Day Streak</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-snap-green font-bold text-sm">240 XP</span>
          </div>
          <button className="size-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 size-2 bg-snap-red rounded-full border border-deep-navy"></span>
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto no-scrollbar">
        <section className="flex flex-col items-center justify-center py-12 px-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-snap-green/20 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full bg-snap-green/10 scale-150 blur-2xl"></div>
            <button 
              onClick={() => navigate('voice-overlay')}
              className="relative size-36 rounded-full bg-gradient-to-tr from-snap-green to-emerald-300 shadow-[0_0_40px_rgba(37,244,182,0.3)] flex items-center justify-center border-4 border-deep-navy"
            >
              <Mic className="text-slate-900 w-16 h-16" />
            </button>
          </div>
          <h3 className="mt-8 font-display text-3xl font-bold tracking-tight text-center">Kuch bhi pucho!</h3>
          <p className="text-slate-400 text-base mt-2">Tap to ask anything in Hinglish</p>
        </section>

        <section className="px-5 grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('camera')}
            className="rounded-2xl p-4 flex flex-col justify-between min-h-[140px] shadow-lg border-2 border-transparent bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:border-snap-green/50 transition-all relative group overflow-hidden"
          >
            <div className="size-10 rounded-lg bg-snap-green/20 flex items-center justify-center text-snap-green mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-white">Snap & Learn</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">Photo se solution</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('diy-picker')}
            className="rounded-2xl p-4 flex flex-col justify-between min-h-[140px] shadow-lg border-2 border-transparent bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:border-snap-orange/50 transition-all relative group overflow-hidden"
          >
            <div className="size-10 rounded-lg bg-snap-orange/20 flex items-center justify-center text-snap-orange mb-3">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-white">DIY Mode</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">Science Experiments</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('homework-capture')}
            className="rounded-2xl p-4 flex flex-col justify-between min-h-[140px] shadow-lg border-2 border-transparent bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:border-snap-purple/50 transition-all relative group overflow-hidden"
          >
            <div className="size-10 rounded-lg bg-snap-purple/20 flex items-center justify-center text-snap-purple mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-white">Homework Helper</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">Expert Guides</p>
            </div>
          </button>

          <button className="rounded-2xl p-4 flex flex-col justify-between min-h-[140px] shadow-lg border-2 border-transparent bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:border-snap-red/50 transition-all relative group overflow-hidden">
            <div className="size-10 rounded-lg bg-snap-red/20 flex items-center justify-center text-snap-red mb-3">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-white">Live Learning</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">Classes with Peers</p>
            </div>
          </button>
        </section>

        <section className="mt-10 mb-6">
          <div className="flex justify-between items-end px-6 mb-6">
            <div>
              <p className="text-[10px] text-snap-green font-bold tracking-[0.2em] uppercase mb-1">Keep it up!</p>
              <h3 className="font-display text-2xl font-bold">Continue Learning</h3>
            </div>
            <button className="text-slate-400 text-sm font-bold flex items-center gap-1 hover:text-snap-green transition-colors">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar snap-x">
            <div className="flex-shrink-0 w-72 rounded-[24px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 border border-white/10 snap-center">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Quadratic Equations</h4>
                    <p className="text-[11px] text-slate-500 font-bold tracking-wide uppercase">CLASS 10 • MATH</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Lesson 4 of 12</span>
                  <span className="text-blue-400">33% Done</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '33%' }}></div>
                </div>
                <button className="w-full mt-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/5 transition-all">
                  Resume Lesson
                </button>
              </div>
            </div>

            <div className="flex-shrink-0 w-72 rounded-[24px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 border border-white/10 snap-center">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Beaker className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Chemical Reactions</h4>
                    <p className="text-[11px] text-slate-500 font-bold tracking-wide uppercase">CLASS 10 • SCIENCE</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Lesson 9 of 10</span>
                  <span className="text-emerald-400">90% Done</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <button className="w-full mt-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/5 transition-all">
                  Resume Lesson
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-deep-navy/90 backdrop-blur-2xl border-t border-white/5 px-6 pt-3 pb-8 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1.5 text-snap-green">
          <div className="relative">
            <Home className="w-6 h-6 fill-current" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-snap-green rounded-full"></span>
          </div>
          <span className="text-[11px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-500">
          <Library className="w-6 h-6" />
          <span className="text-[11px] font-medium">Library</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-500">
          <div className="size-12 -mt-8 bg-gradient-to-tr from-snap-green to-blue-400 rounded-2xl flex items-center justify-center shadow-xl shadow-snap-green/20 border-4 border-deep-navy">
            <Plus className="text-deep-navy w-6 h-6 font-bold" />
          </div>
          <span className="text-[11px] font-medium">Create</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-500">
          <Trophy className="w-6 h-6" />
          <span className="text-[11px] font-medium">Ranks</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-500">
          <User className="w-6 h-6" />
          <span className="text-[11px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}
