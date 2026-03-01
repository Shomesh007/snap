import React, { useState } from 'react';
import { ArrowLeft, Info, Search, Star, Clock, Play, BookOpen, Hammer, Rocket, Trophy, User } from 'lucide-react';

interface Props {
  onBack: () => void;
  onSelect: () => void;
}

const experiments = [
  {
    id: '1',
    title: 'Invisible Ink Secret',
    difficulty: 'EASY',
    time: '15 min',
    rating: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9LBhN0QTciPYAgajsmPx56LTRi-TAWy6KI2kWLUc8lnRts-4CXbxcrF2lsylUhhF29cqSBoH9UXqAnh90rlPVW149J0rU-7KoEV9vN8OSkMZTYOgLZuZKgLfAjkeLLMM0VZnYStXOVz5Fx0cc1SIrQt6hKhj5wrrMYWyla6uC0fd2vwcZZVcL8inPlxGmykCDJRXjBcrfRyw3DUenu2NOnFFHoLG2D47VGQmICt3euDe_9vu2eV05tJ36TbdLSPpPw9S8--WNb_RS'
  },
  {
    id: '2',
    title: 'Lemon Battery Hack',
    difficulty: 'MEDIUM',
    time: '30 min',
    rating: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASMMWygzRmj1r5Uc_avRK5wCpS60qqx9sZRu8qspoSsUk0nly2GHcRJnqFZgbBCPaBPZNSSMuqTZK0E0aAQXL_gt9Q6ZM7EfH94I6AGmL8TZy_VG_1ySYDwgDDMvVF6syYQfJsORPEoYDcTPyOdthd5ongJOmT2z9kZeozarWtM2b032hlOFdMFU2EFmRerPo5fp-CPJ47xek1FEBgOeKAGQLj2yoWmmLmAVyWtchWGhXkEh2EcahNvoHMNb7jRtUE7mDSgST70elA'
  },
  {
    id: '3',
    title: 'Kitchen Volcano',
    difficulty: 'PRO',
    time: '45 min',
    rating: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABJsRcTPHJStGyIYVO_Lmb9hnJJ6EsXxf8y0q1tWrWdOF0KAXyFXzLsKdiaeZ_aRh5Wx2bQ8kVNJDnfFInVTCpasQHfrV7VMVtNSS7-nJnWr5SQtJcg3Ha4E8SqIoIHwM_3gD0Lbe4tE5ldRIQwb0hGHlJfWKz7Se63mn6lSCdzbc_Nwb1VSpBSqqqN5sVgpwOwFLqSBkVz-JhoSuTjLlBa_FU5teO_R_eVQwORSsnoD7__xgOHJvu64EYobTdE4vUMkGafmy1-sw0'
  }
];

export default function DIYPickerScreen({ onBack, onSelect }: Props) {
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

      <main className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExp(exp)}
              className="bg-primary/10 rounded-xl p-3 border border-primary/20 relative overflow-hidden group text-left"
            >
              <div className="aspect-square rounded-lg mb-3 overflow-hidden bg-slate-800">
                <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] font-bold text-primary bg-primary/20 px-2 py-0.5 rounded uppercase">{exp.difficulty}</span>
              </div>
              <h3 className="font-bold text-sm mb-1 leading-tight">{exp.title}</h3>
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-background-dark w-full max-w-md rounded-t-lg sm:rounded-lg overflow-hidden shadow-2xl border-t border-primary/30">
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
                onClick={onSelect}
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
