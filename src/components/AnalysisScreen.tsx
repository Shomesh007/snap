import React from 'react';
import { Microscope, Beaker, Bolt, Brain, Camera, Home, Flame, User } from 'lucide-react';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export default function AnalysisScreen({ onBack, onNext }: Props) {
  return (
    <div className="relative h-screen w-full max-w-md mx-auto overflow-hidden bg-background-dark shadow-2xl">
      <div className="absolute inset-0 z-0">
        <img 
          className="h-full w-full object-cover opacity-40 scale-105" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_L4gB2WaQb4T5-Puv-LVGnn3XC95p-ghxMcAYbmoR1yvlMmWNlDYxpmyoHoa8EjPDqLOmSLywIlYHLi1G2l5SeybGLMhF59pEa7q1J42Ohdvga4K56x3r_wW35gMxW4zURP3TLHMLgbq06M4vA8_Lqco-4ah9QB9fbNnwwQeCV973qGNi5z4ReKJaFBDvpNA873pj1dOjSjbF0URkbLl1HiiJiT8aLDU063Sr49XoDmDwlh6NCorRUiNemNVhDwZS-__owQC3v2Xz" 
          alt="Neem"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/20 via-background-dark/60 to-background-dark"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 h-[92%] bg-background-dark/95 backdrop-blur-xl rounded-t-[2.5rem] border-t border-primary/20 flex flex-col overflow-hidden">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-10 bg-white/20 rounded-full"></div>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Neem Tree <span className="text-2xl">🌿</span>
            </h1>
            <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase italic">AI Analyzed</span>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            <button className="relative overflow-hidden transition-all duration-300 border border-primary bg-primary/20 px-5 py-2.5 rounded-xl flex items-center gap-2">
              <Microscope className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Biology</span>
            </button>
            <button className="relative overflow-hidden transition-all duration-300 border border-primary/30 bg-slate-800/60 px-5 py-2.5 rounded-xl flex items-center gap-2 text-slate-400">
              <Beaker className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Chemistry</span>
            </button>
            <button className="relative overflow-hidden transition-all duration-300 border border-primary/30 bg-slate-800/60 px-5 py-2.5 rounded-xl flex items-center gap-2 text-slate-400">
              <Bolt className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Physics</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 font-body pb-40">
          <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-5 mb-6 space-y-4">
            <h4 className="text-xs font-bold text-primary/80 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-primary rounded-full"></span> Key Highlights
            </h4>
            
            <div className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl">
              <p className="text-[15px] leading-snug">
                Iski leaves <span className="text-primary font-bold">antibacterial</span> hoti hain, making it a natural 
                <span className="bg-primary/20 text-primary px-1 mx-1 rounded">pesticide</span>.
              </p>
            </div>
            
            <div className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl">
              <p className="text-[15px] leading-snug">
                India mein ise <span className="text-white font-bold italic underline decoration-primary/40 underline-offset-4">'Village Pharmacy'</span> kehte hain.
              </p>
            </div>
            
            <div className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl">
              <p className="text-[15px] leading-snug">
                Scientific Name: <span className="text-primary italic font-medium">Azadirachta indica</span>. Bio exams ke liye imp hai!
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-primary/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Brain className="text-primary w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold">Quick Check!</h3>
            </div>
            <p className="text-slate-200 text-sm mb-6 leading-relaxed">Neem ko <span className="text-primary">"Village Pharmacy"</span> kyun kaha jata hai?</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-slate-800/40 border border-white/10 rounded-2xl transition-all active:scale-95 group">
                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center mb-2 group-active:bg-primary/20">
                  <span className="font-display font-black text-xl text-slate-400 group-active:text-primary">A</span>
                </div>
                <span className="text-[11px] font-bold text-slate-300 text-center uppercase tracking-tight">Kyunki yeh bahut lamba hai</span>
              </button>
              <button 
                onClick={onNext}
                className="flex flex-col items-center justify-center p-4 bg-primary/10 border border-primary/40 rounded-2xl transition-all active:scale-95 group shadow-[0_0_15px_rgba(37,244,182,0.1)]"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-2">
                  <span className="font-display font-black text-xl text-background-dark">B</span>
                </div>
                <span className="text-[11px] font-bold text-primary text-center uppercase tracking-tight italic">Medicinal properties ki wajah se</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 left-0 right-0 px-8 z-30 flex justify-center">
          <button 
            onClick={onBack}
            className="bg-primary px-8 py-3.5 rounded-full flex items-center gap-2.5 transition-transform active:scale-95 shadow-[0_4px_20px_-2px_rgba(37,244,182,0.3)]"
          >
            <Camera className="text-background-dark w-5 h-5 font-bold" />
            <span className="font-display font-bold text-[11px] text-background-dark tracking-wider uppercase">Aur photo lo! Next Challenge →</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-background-dark/95 border-t border-white/5 px-6 pt-4 pb-8 backdrop-blur-xl">
          <button onClick={onBack} className="flex flex-col items-center gap-1 text-slate-500">
            <Home className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">HOME</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <div className="bg-primary/20 p-2 -mt-6 rounded-2xl border border-primary/30 shadow-[0_0_15px_rgba(37,244,182,0.2)]">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">SCAN</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500">
            <Flame className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">STREAK</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500">
            <User className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">ME</span>
          </button>
        </div>
      </div>
    </div>
  );
}
