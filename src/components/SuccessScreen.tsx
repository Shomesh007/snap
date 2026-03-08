import React from 'react';
import { Trophy, Star, ArrowRight, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { AppState } from '../store/appStore';

interface Props {
  onNext: () => void;
  appState: AppState;
}

export default function SuccessScreen({ onNext, appState }: Props) {
  const experiment = appState.diyExperiment;
  const xpEarned = experiment?.xpEarned ?? 150;
  const badge = experiment?.badge ?? '🌿 Village Scientist';

  return (
    <div className="h-full bg-deep-navy flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: -120 }}
            transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="absolute text-2xl"
            style={{
              left: `${15 + i * 10}%`,
              top: '60%',
            }}
          >
            {['⭐', '🌟', '✨', '🎉', '🔥', '💥', '🎊', '⚡'][i]}
          </motion.div>
        ))}
      </div>

      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl scale-150" />
        <div className="relative size-28 rounded-3xl bg-gradient-to-br from-yellow-400 to-snap-orange flex items-center justify-center shadow-2xl shadow-yellow-400/30 border-4 border-yellow-300/30">
          <Trophy className="text-deep-navy w-14 h-14" />
        </div>
      </motion.div>

      {/* Celebration text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-4xl font-black text-white mb-2">
          TU NE KAR DIYA!! 🔥
        </h1>
        <p className="text-primary text-lg font-bold">Experiment Complete!</p>
        {experiment?.conceptSummary && (
          <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
            {experiment.conceptSummary}
          </p>
        )}
      </motion.div>

      {/* XP + Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 mb-8 w-full max-w-xs"
      >
        <div className="flex-1 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="text-yellow-400 w-4 h-4 fill-current" />
            <span className="text-yellow-400 font-display font-bold text-xl">+{xpEarned}</span>
          </div>
          <p className="text-slate-400 text-xs">XP Earned</p>
        </div>
        <div className="flex-1 bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center">
          <p className="font-display font-bold text-white text-base mb-0.5">{badge}</p>
          <p className="text-slate-400 text-xs">Badge Unlocked!</p>
        </div>
      </motion.div>

      {/* Stats update */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-5 mb-8"
      >
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Your Progress</p>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="font-display font-bold text-xl text-white">{appState.xp}</p>
            <p className="text-slate-400 text-[10px]">Total XP</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-xl text-snap-orange">{appState.experimentsCount}</p>
            <p className="text-slate-400 text-[10px]">Experiments</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-xl text-yellow-400">{appState.badges.length}</p>
            <p className="text-slate-400 text-[10px]">Badges</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        onClick={onNext}
        className="w-full max-w-xs flex items-center justify-center gap-3 py-5 bg-primary rounded-2xl font-display font-bold text-deep-navy text-lg shadow-[0_4px_20px_rgba(37,244,182,0.3)] active:scale-98 transition-transform"
      >
        Ghar Chalte Hain! <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
