import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onComplete?: () => void;
  isSnapMode?: boolean;
  message?: string;
}

const PROCESSING_MSGS_SNAP = [
  'Dekh raha hoon... 👀',
  'Soch raha hoon... 🧠',
  'Arre interesting hai! 🤩',
  'Bio, Chem, Physics connect kar raha hoon... 🔗',
  'Ready ho ja!! 🔥',
];

const PROCESSING_MSGS_HOMEWORK = [
  'Question padh raha hoon... 📖',
  'Step-by-step plan bana raha hoon... 🎯',
  'Tere liye hints taiyar kar raha hoon... 💡',
  'Almost done yaar! ⚡',
];

export default function ProcessingScreen({ onComplete, isSnapMode = true, message }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const msgs = isSnapMode ? PROCESSING_MSGS_SNAP : PROCESSING_MSGS_HOMEWORK;

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % msgs.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [msgs.length]);

  // Animate progress (just visual — actual completion comes from parent)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90; // Stop at 90% — parent will complete the flow
        return prev + Math.random() * 5;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background-dark overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-snap-purple/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-primary w-10 h-10 animate-pulse" />
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>

        {/* Animated message */}
        <motion.div
          key={msgIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center gap-2"
        >
          <h2 className="font-display text-2xl font-bold text-white">
            {msgs[msgIdx]}
          </h2>
          <p className="text-primary text-sm font-medium opacity-80">
            {isSnapMode ? 'AI se science lesson generate ho raha hai...' : 'AI solution step-by-step tayar kar raha hai...'}
          </p>
        </motion.div>

        {/* Subject pills */}
        {isSnapMode && (
          <div className="flex gap-2 flex-wrap justify-center">
            {['Biology 🧬', 'Chemistry ⚗️', 'Physics ⚙️'].map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold"
              >
                {s}
              </motion.span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-slate-400">Processing...</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <p className="text-slate-500 text-xs italic font-body">
          "Curiosity ne hi Newton ko apple ke neeche baitha diya tha! 🍎"
        </p>
      </div>
    </div>
  );
}
