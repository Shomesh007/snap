import React, { useRef, useEffect, useState } from 'react';
import { X, Flashlight, CheckCircle2, Image as ImageIcon, Camera, RefreshCw, Droplet } from 'lucide-react';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export default function DIYStepScreen({ onBack, onComplete }: Props) {
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark">
      <div className="relative h-[45%] w-full bg-slate-800">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 via-transparent to-background-dark/60"></div>
        
        <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between">
          <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full bg-background-dark/40 backdrop-blur-md">
            <X className="text-white w-6 h-6" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-background-dark/40 backdrop-blur-md border border-white/10">
            <span className="text-white text-sm font-bold tracking-tight">Turmeric pH Test</span>
          </div>
          <button className="flex size-10 items-center justify-center rounded-full bg-background-dark/40 backdrop-blur-md">
            <Flashlight className="text-white w-6 h-6" />
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-primary/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/40 shadow-[0_0_15px_rgba(244,140,37,0.8)]"></div>
          </div>
        </div>
      </div>

      <div className="relative h-[55%] w-full bg-background-dark rounded-t-lg shadow-2xl flex flex-col">
        <div className="flex flex-col items-center pt-2 pb-4">
          <div className="h-1.5 w-12 rounded-full bg-slate-700 mb-6"></div>
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <div className="h-2 w-8 rounded-full bg-primary"></div>
            <div className="h-2 w-2 rounded-full bg-slate-700"></div>
            <div className="h-2 w-2 rounded-full bg-slate-700"></div>
            <div className="h-2 w-2 rounded-full bg-slate-700"></div>
          </div>
        </div>

        <div className="flex-1 px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            Step 2 of 5
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-6">
            Ab <span className="text-primary">turmeric</span> paani mein milao! 🥣
          </h1>

          <div className="w-full flex justify-center py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full"></div>
              <div className="relative z-10 flex flex-col items-center">
                <Droplet className="w-16 h-16 text-primary animate-bounce" />
                <div className="mt-2 w-20 h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm italic mt-2">
            Mix well until the water turns yellow
          </p>
        </div>

        <div className="p-6">
          <button 
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white h-16 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-6 h-6 font-bold" />
            SAHI!! Next step →
          </button>
        </div>
      </div>

      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 z-50">
        <button className="size-12 rounded-full bg-background-dark/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
          <ImageIcon className="w-6 h-6" />
        </button>
        <button className="size-16 rounded-full bg-white flex items-center justify-center text-background-dark shadow-xl ring-4 ring-primary/30">
          <Camera className="w-8 h-8 font-bold" />
        </button>
        <button className="size-12 rounded-full bg-background-dark/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
