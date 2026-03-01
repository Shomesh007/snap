import React, { useState, useEffect } from 'react';
import { X, Square } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onBack: () => void;
  onStop: () => void;
}

export default function VoiceOverlay({ onBack, onStop }: Props) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative h-full w-full bg-deep-navy/90 backdrop-blur-xl flex flex-col">
      <div className="flex items-center p-4 pt-12 justify-between">
        <button onClick={onBack} className="p-2 text-slate-100">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">Recording</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full h-48 flex items-center justify-center gap-1.5 mb-12">
          {[0.4, 0.6, 0.8, 1, 0.7, 0.9, 0.6, 0.8, 0.5, 0.7, 0.4].map((opacity, i) => (
            <motion.div
              key={i}
              animate={{ height: [20, 60, 20] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              className="w-1.5 bg-primary rounded-full"
              style={{ opacity }}
            />
          ))}
        </div>

        <h1 className="font-display text-4xl text-white text-center mb-2 tracking-tight">
          Bol raha hoon... 🎤
        </h1>
        <p className="text-primary/60 text-lg font-medium">Listening to your doubt</p>
      </div>

      <div className="pb-16 flex flex-col items-center gap-8">
        <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <span className="text-white font-mono text-xl tabular-nums tracking-widest">{formatTime(timer)}</span>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-snap-red/20 rounded-full scale-125 animate-ping"></div>
          <button 
            onClick={onStop}
            className="relative flex flex-col items-center justify-center size-24 bg-snap-red hover:bg-red-600 transition-colors rounded-full shadow-[0_0_30px_rgba(255,71,87,0.4)]"
          >
            <Square className="text-white w-10 h-10 fill-current" />
          </button>
        </div>
        <span className="text-white/60 font-bold text-sm tracking-widest uppercase">Tap to Stop</span>
      </div>

      <div className="absolute bottom-6 w-full flex justify-center">
        <div className="flex items-center gap-2 opacity-40">
          <div className="size-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-[10px] text-deep-navy font-bold">SL</span>
          </div>
          <span className="text-white font-bold tracking-tight">SnapLearn</span>
        </div>
      </div>
    </div>
  );
}
