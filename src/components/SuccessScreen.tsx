import React from 'react';
import { X, Share2, RefreshCw, Home, Microscope, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onNext: () => void;
}

export default function SuccessScreen({ onNext }: Props) {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-x-hidden bg-background-dark">
      <div className="flex items-center p-4 justify-between z-10">
        <button onClick={onNext} className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Experiment Mastery</h2>
        <button className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/40 blur-xl rounded-full opacity-75"></div>
          <div className="relative bg-background-dark border-4 border-primary rounded-full p-1 shadow-[0_0_40px_rgba(244,157,37,0.4)]">
            <div className="bg-slate-900 rounded-full w-48 h-48 flex items-center justify-center text-8xl">
              🧪
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary px-6 py-2 rounded-full shadow-lg border-2 border-background-dark">
            <span className="text-background-dark font-black text-xl">+150 XP</span>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic font-display">Kitchen Chemist</h1>
          <p className="text-slate-400 mt-2 font-medium">LEVEL UP! Level 14 Reached</p>
        </div>

        <div className="mt-12 w-full max-w-sm flex items-end gap-3 px-2">
          <div className="flex-shrink-0 size-12 rounded-full border-2 border-primary overflow-hidden bg-primary/10">
            <img 
              alt="AI Friend" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyprrGEYUXhPmwD5v1KC34f1TpgxDTNOPgLbBocpTjc0egm0sGBp998Om6uppz_RmQJFkUbSLpwFzzK2DLUyc5K1Vr5P6fTS1TCPT-Bgcz3m_ODo7ZMjP4sTwqmZ99yiMb3WN7wt9DRGrjMaELIHjOwBOgc8duxOI8asaq8ZQaLPALBoisFVua5uF3qehqvgISeZG4e0e6YIsdRARGw9mIbJhHXU-M5vG315cYPtVjgH_tl0g3nAWZi8y71NfKmSvfiST6qur7GGfC" 
            />
          </div>
          <div className="flex-1 bg-primary text-background-dark p-4 rounded-t-2xl rounded-br-2xl relative shadow-xl">
            <p className="font-bold text-lg leading-snug">BHAI TU NE KAR DIYA!! 🔥🔥🔥</p>
            <p className="font-medium text-sm">Main bol raha tha na tu kar sakta hai!!</p>
            <div className="absolute bottom-0 -left-2 w-4 h-4 bg-primary" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3 z-10">
        <button 
          onClick={onNext}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-primary/20"
        >
          <RefreshCw className="w-5 h-5" />
          Try Another Experiment
        </button>
        <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95">
          <Share2 className="w-5 h-5" />
          Show off to Friends
        </button>
      </div>

      <div className="flex gap-2 border-t border-primary/10 bg-background-dark px-4 pb-8 pt-2">
        <button onClick={onNext} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <Home className="w-6 h-6" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
          <Microscope className="w-6 h-6 fill-current" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Lab</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <Trophy className="w-6 h-6" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Quests</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <User className="w-6 h-6" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Profile</p>
        </button>
      </div>
    </div>
  );
}
