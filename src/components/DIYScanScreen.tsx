import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, HelpCircle, Sun, Beaker, PlusCircle, Home, Microscope, Trophy, User, Sparkles } from 'lucide-react';

interface Props {
  onBack: () => void;
  onStart: () => void;
}

export default function DIYScanScreen({ onBack, onStart }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-dark overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute bottom-[-50%] left-[-50%] right-[-50%] h-[200%] bg-[linear-gradient(to_right,rgba(244,140,37,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,140,37,0.2)_1px,transparent_1px)] bg-[length:40px_40px] [perspective:1000px] [transform:rotateX(60deg)] z-10"></div>
        <div className="absolute top-[40%] w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent z-20"></div>
        
        <div className="absolute top-[35%] left-[25%] z-30">
          <div className="flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full shadow-lg shadow-primary/40 border border-white/20">
            <Sun className="text-white w-4 h-4" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">Lemon</span>
          </div>
          <div className="w-0.5 h-12 bg-primary/60 mx-auto mt-0.5"></div>
        </div>
        
        <div className="absolute top-[55%] right-[20%] z-30">
          <div className="flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full shadow-lg shadow-primary/40 border border-white/20">
            <Beaker className="text-white w-4 h-4" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">Turmeric</span>
          </div>
          <div className="w-0.5 h-16 bg-primary/60 mx-auto mt-0.5"></div>
        </div>
      </div>

      <div className="relative z-40 flex items-center bg-black/20 backdrop-blur-md p-4 pb-4 justify-between">
        <button onClick={onBack} className="text-white flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 px-4">
          <h2 className="text-white text-base font-bold leading-tight tracking-tight">Apna kitchen / ghar dikhao mujhe! 👀</h2>
          <p className="text-white/70 text-[10px] uppercase font-semibold tracking-widest">DIY MODE: SCANNING</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-white/10">
          <HelpCircle className="text-white w-6 h-6" />
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="relative z-50 flex flex-col justify-end items-stretch">
        <div className="flex flex-col items-stretch bg-background-dark rounded-t-lg shadow-2xl border-t border-primary/20">
          <div className="flex h-6 w-full items-center justify-center">
            <div className="h-1.5 w-12 rounded-full bg-primary/30"></div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-100 text-xl font-bold leading-tight tracking-tight">Detected Items</h3>
              <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">2 FOUND</span>
            </div>
            
            <div className="flex gap-3 flex-wrap mb-8">
              <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/20 border border-primary/40 pl-3 pr-5">
                <Sparkles className="text-primary w-5 h-5" />
                <p className="text-slate-100 text-sm font-semibold">Lemon</p>
              </div>
              <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/20 border border-primary/40 pl-3 pr-5">
                <Sparkles className="text-primary w-5 h-5" />
                <p className="text-slate-100 text-sm font-semibold">Turmeric</p>
              </div>
              <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/5 border border-white/10 border-dashed pl-3 pr-5 opacity-50">
                <PlusCircle className="text-white/40 w-5 h-5" />
                <p className="text-white/40 text-sm font-semibold">Add More</p>
              </div>
            </div>

            <button 
              onClick={onStart}
              className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-3 h-16 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 mb-4"
            >
              <span className="text-lg font-bold">Experiment Shuru Karo! 🔥</span>
            </button>
            <p className="text-center text-slate-400 text-xs mb-4">Move your phone to find more ingredients</p>
          </div>
        </div>
      </div>

      <div className="relative z-50 h-20 bg-background-dark flex items-center justify-around px-8 border-t border-white/5">
        <div className="flex flex-col items-center gap-1 opacity-50">
          <Home className="w-6 h-6 text-slate-100" />
          <span className="text-[10px] text-slate-100 font-medium">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Microscope className="w-6 h-6 text-primary fill-current" />
          </div>
          <span className="text-[10px] text-primary font-bold">DIY Lab</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50">
          <Trophy className="w-6 h-6 text-slate-100" />
          <span className="text-[10px] text-slate-100 font-medium">Quests</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50">
          <User className="w-6 h-6 text-slate-100" />
          <span className="text-[10px] text-slate-100 font-medium">Profile</span>
        </div>
      </div>
    </div>
  );
}
