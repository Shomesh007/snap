import React, { useState } from 'react';
import { ArrowLeft, Info, Search, Star, Clock, Play, BookOpen, Hammer, Rocket, Trophy, User } from 'lucide-react';

import { AppState } from '../store/appStore';

interface Props {
  onBack: () => void;
  onSelect: (concept: string) => void;  // passes concept directly to App
  appState: AppState;
  setAppState: (s: AppState) => void;
}

const experiments = [
  { id: '1', title: 'pH Indicator Test', concept: 'Acids, Bases and Salts', difficulty: 'EASY', time: '8 min', rating: 3, emoji: '🧪', subject: 'Chemistry' },
  { id: '2', title: 'Invisible Ink Secret', concept: 'Chemical Reactions & Heating', difficulty: 'EASY', time: '15 min', rating: 2, emoji: '✍️', subject: 'Chemistry' },
  { id: '3', title: 'Lemon Battery Hack', concept: 'Electric Cells & Current', difficulty: 'MEDIUM', time: '30 min', rating: 3, emoji: '⚡', subject: 'Physics' },
  { id: '4', title: 'Kitchen Volcano', concept: 'Acid-Base Reactions & CO2', difficulty: 'EASY', time: '10 min', rating: 3, emoji: '🌋', subject: 'Chemistry' },
  { id: '5', title: 'Densità Tower', concept: 'Density & Immiscibility', difficulty: 'EASY', time: '12 min', rating: 3, emoji: '🏗️', subject: 'Physics' },
  { id: '6', title: 'Homemade Compass', concept: 'Magnetic Field & Direction', difficulty: 'MEDIUM', time: '20 min', rating: 2, emoji: '🧭', subject: 'Physics' },
];

export default function DIYPickerScreen({ onBack, onSelect, appState, setAppState }: Props) {
  const [selectedExp, setSelectedExp] = useState<any>(null);

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="p-2 rounded-full bg-primary/10 text-primary">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-center flex-1">🔨 DIY Mode</h1>
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Info className="w-6 h-6" />
          </div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Ghar pe real experiments karo!</h2>
          <p className="text-slate-400 text-sm">Turn your kitchen into a science lab 🚀</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="text"
            placeholder="Search experiments..."
            className="w-full bg-primary/10 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button className="flex-none px-6 py-2 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/20">All</button>
          <button className="flex-none px-6 py-2 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">Chemistry</button>
          <button className="flex-none px-6 py-2 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">Physics</button>
          <button className="flex-none px-6 py-2 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">Biology</button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 pb-8">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExp(exp)}
              className="bg-white/5 rounded-2xl px-4 pt-5 pb-4 border border-white/10 relative overflow-hidden text-left hover:bg-white/8 transition-colors"
            >
              <div className="text-4xl mb-3">{exp.emoji}</div>
              <div className="flex items-center gap-1 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${exp.difficulty === 'EASY' ? 'bg-primary/20 text-primary' : 'bg-yellow-400/20 text-yellow-400'}`}>{exp.difficulty}</span>
                <span className="text-[10px] text-slate-400">• {exp.subject}</span>
              </div>
              <h3 className="font-display font-bold text-sm mb-1 leading-tight text-white">{exp.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex text-yellow-500">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < exp.rating ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{exp.time}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {selectedExp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-background-dark w-full max-w-md rounded-t-lg sm:rounded-lg overflow-y-auto max-h-[90vh] shadow-2xl border-t border-primary/30">
            <div className="relative h-48">
              <img src={selectedExp.image} alt={selectedExp.title} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedExp(null)} className="absolute top-4 right-4 bg-black/40 text-white rounded-full p-1 backdrop-blur-md">
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Trending 🔥</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedExp.title}</h2>
                  <p className="text-primary font-medium flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> Chemistry Mastery
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex text-yellow-500 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{selectedExp.difficulty} Level</p>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                  <Clock className="text-primary w-5 h-5 mx-auto mb-1" />
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Time</p>
                  <p className="font-bold">{selectedExp.time}</p>
                </div>
                <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                  <Hammer className="text-primary w-5 h-5 mx-auto mb-1" />
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Items</p>
                  <p className="font-bold">6 Tools</p>
                </div>
                <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                  <Trophy className="text-primary w-5 h-5 mx-auto mb-1" />
                  <p className="text-[10px] uppercase text-slate-500 font-bold">XP</p>
                  <p className="font-bold">+500</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Ever wanted to see a mountain blow up? Is experiment mein hum seekhenge chemical reactions ke baare mein using simple kitchen items like baking soda and vinegar!
              </p>
              <button
                onClick={() => {
                  setAppState({ ...appState, diyExperiment: null });
                  onSelect(selectedExp?.concept || 'Science experiment');
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/20"
              >
                Shuru Karo!
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="sticky bottom-0 bg-background-dark border-t border-primary/20 px-6 py-3 flex justify-between items-center z-10">
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold">Learn</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <Hammer className="w-6 h-6 fill-current" />
          <span className="text-[10px] font-bold">DIY</span>
        </button>
        <div className="relative -top-6">
          <div className="bg-primary p-4 rounded-full shadow-lg shadow-primary/40 text-white border-4 border-background-dark">
            <Rocket className="w-6 h-6" />
          </div>
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-bold">Compete</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
