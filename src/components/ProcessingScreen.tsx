import React, { useEffect, useState } from 'react';
import { X, HelpCircle, Sparkles, Home, Scan, Target, User } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onComplete: () => void;
}

export default function ProcessingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="relative flex h-screen w-full flex-col max-w-[430px] mx-auto bg-background-dark border-x border-primary/10 shadow-2xl overflow-hidden">
      <div className="z-20 flex items-center bg-transparent p-4 justify-between">
        <button className="text-slate-100 flex size-12 shrink-0 items-center justify-start">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-display text-primary text-xl font-extrabold leading-tight tracking-tight flex-1 text-center">SnapLearn</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center rounded-full h-10 w-10 bg-primary/20 text-primary">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 w-full flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/80 z-10"></div>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_LaYD7RzXzr2dKqLayEZ0KONvJN9hq2SP-9gdK3wVcRpVn1oHC1yZkRRKihnN1xn40ddv99ns70Lyf9iqA7-8uFupPNe1zxhoLG0YqR1Pqhz7tmFk5XFO6w7uQtNkacTmd01jiXyCUHmvTfIo0igJc4WuvvdpFESVx_JG6riQ8utMjHA5BM36WTf50qMJRxEpTzNs5vYm5HriXhkuFc-fVN575zetbGT11L78xHOGPEXs08bHXAIHQqMzlbW3UtmKDqheVcgb3bMF" 
            className="w-full h-full object-cover"
            alt="Processing"
          />
        </div>

        <div className="z-20 flex flex-col items-center gap-8 w-full">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary/10 border-l-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-primary w-8 h-8 animate-pulse" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <h1 className="font-display text-3xl md:text-4xl text-white font-extrabold leading-tight tracking-tight drop-shadow-lg">
              Arre interesting hai! 🔥
            </h1>
            <p className="text-primary font-body text-lg font-medium tracking-wide opacity-90">
              AI magic is analyzing your scan...
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <span className="px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest">
              Scanning Physics
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
              Grade 10
            </span>
          </div>
        </div>
      </div>

      <div className="z-20 flex flex-col gap-4 p-6 bg-background-dark/80 backdrop-blur-md border-t border-primary/10">
        <div className="flex gap-6 justify-between items-end">
          <div className="flex flex-col gap-1">
            <p className="text-primary text-xs font-bold uppercase tracking-tighter">Current Step</p>
            <p className="text-white text-base font-semibold">Extracting formulas...</p>
          </div>
          <p className="text-primary font-display text-2xl font-bold">{progress}%</p>
        </div>
        
        <div className="h-3 w-full rounded-full bg-primary/10 overflow-hidden border border-primary/5">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary" 
            style={{ width: `${progress}%` }}
          ></motion.div>
        </div>
        <p className="text-slate-400 text-xs text-center font-body italic">"Fun fact: Light travels faster than sound!"</p>
      </div>

      <div className="z-20 flex gap-2 border-t border-primary/10 bg-background-dark px-4 pb-8 pt-4">
        <div className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-500">
          <Home className="w-6 h-6" />
          <p className="text-[10px] font-bold uppercase tracking-tighter">Home</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-end gap-1 text-primary">
          <div className="relative">
            <Scan className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tighter">Scan</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-500">
          <Target className="w-6 h-6" />
          <p className="text-[10px] font-bold uppercase tracking-tighter">Quest</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-500">
          <User className="w-6 h-6" />
          <p className="text-[10px] font-bold uppercase tracking-tighter">Profile</p>
        </div>
      </div>
    </div>
  );
}
