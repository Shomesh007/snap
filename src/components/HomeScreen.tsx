import React from 'react';
import { UserProfile, Screen } from '../types';
import { AppState, getLevelFromXP, LEVEL_NAMES } from '../store/appStore';
import {
  Bell, Flame, Mic, Camera, FlaskConical, BookOpen, Video,
  Home, Plus, Trophy, User, ChevronRight, Target, Star
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  navigate: (screen: Screen) => void;
  profile: UserProfile;
  appState: AppState;
}

const MODE_CARDS = [
  {
    id: 'snap',
    title: 'Snap & Learn',
    desc: 'Photo se science lesson',
    icon: Camera,
    screen: 'camera' as Screen,
    color: '#25f4b6',
    bg: 'from-[#25f4b6]/20 to-[#25f4b6]/5',
    border: 'hover:border-[#25f4b6]/50',
    shadow: 'shadow-[#25f4b6]',
    emoji: '📸',
  },
  {
    id: 'diy',
    title: 'DIY Mode',
    desc: 'Kitchen se science!',
    icon: FlaskConical,
    screen: 'diy-picker' as Screen,
    color: '#FF6B35',
    bg: 'from-[#FF6B35]/20 to-[#FF6B35]/5',
    border: 'hover:border-[#FF6B35]/50',
    shadow: '#FF6B35',
    emoji: '🧪',
  },
  {
    id: 'homework',
    title: 'Homework Helper',
    desc: 'Step-by-step guide',
    icon: BookOpen,
    screen: 'homework-capture' as Screen,
    color: '#A55EEA',
    bg: 'from-[#A55EEA]/20 to-[#A55EEA]/5',
    border: 'hover:border-[#A55EEA]/50',
    shadow: '#A55EEA',
    emoji: '📚',
  },
  {
    id: 'live',
    title: 'Live Learning',
    desc: 'Aas-paas se seekho',
    icon: Video,
    screen: 'live-learning' as Screen,
    color: '#FF4757',
    bg: 'from-[#FF4757]/20 to-[#FF4757]/5',
    border: 'hover:border-[#FF4757]/50',
    shadow: '#FF4757',
    emoji: '🎥',
  },
];

export default function HomeScreen({ navigate, profile, appState }: Props) {
  const level = getLevelFromXP(appState.xp);
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];

  return (
    <div className="flex flex-col h-full bg-deep-navy text-slate-100 pb-28 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-5 sticky top-0 bg-deep-navy/90 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('profile')}
            className="size-11 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center p-[2px] shadow-lg shadow-primary/30"
          >
            <div className="bg-deep-navy rounded-full w-full h-full flex items-center justify-center overflow-hidden">
              <span className="text-primary font-display text-xl font-bold">{profile.name[0] || 'P'}</span>
            </div>
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-display font-bold leading-tight">
              Namaste, {profile.name || 'Yaar'}! 👋
            </h2>
            <div className="flex items-center gap-1.5">
              {appState.streak > 0 ? (
                <>
                  <Flame className="text-snap-red w-3.5 h-3.5 fill-current" />
                  <span className="text-snap-red text-xs font-bold">{appState.streak} Day Streak!</span>
                </>
              ) : (
                <>
                  <Star className="text-primary w-3.5 h-3.5 fill-current" />
                  <span className="text-primary text-xs font-bold">{levelName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('exam-predictor')}
            className="flex items-center gap-1 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30"
          >
            <Target className="text-yellow-400 w-3.5 h-3.5" />
            <span className="text-yellow-400 font-bold text-xs">{appState.xp} XP</span>
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Big voice button */}
        <section className="flex flex-col items-center justify-center py-10 px-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60 scale-110" />
            <div className="absolute inset-0 rounded-full bg-primary/10 scale-150 blur-2xl" />
            <motion.button
              onClick={() => navigate('chat')}
              whileTap={{ scale: 0.95 }}
              className="relative size-36 rounded-full bg-gradient-to-tr from-primary to-emerald-300 shadow-[0_0_50px_rgba(37,244,182,0.3)] flex items-center justify-center border-4 border-deep-navy"
            >
              <Mic className="text-slate-900 w-16 h-16" />
            </motion.button>
          </div>
          <h3 className="mt-8 font-display text-3xl font-bold tracking-tight text-center">Kuch bhi pucho!</h3>
          <p className="text-slate-400 text-base mt-2 text-center">Tap to chat with AI in Hinglish 🤖</p>
        </section>

        {/* ── Discovery Challenge Hero Card ── */}
        <section className="px-5 mt-2 mb-4">
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('discovery-challenge')}
            className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 shadow-xl shadow-indigo-500/30 border border-indigo-400/20"
          >
            {/* Pulsing background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse rounded-3xl" />

            {/* NEW badge */}
            <div className="absolute top-3 right-3 bg-yellow-400 text-slate-900 text-[10px] font-display font-bold px-2.5 py-1 rounded-full shadow-md">
              ⚡ NEW
            </div>

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="size-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-3xl">🎯</span>
              </div>

              {/* Text */}
              <div className="flex-1 text-left">
                <h3 className="font-display font-bold text-white text-xl leading-tight">
                  Discovery Challenge
                </h3>
                <p className="text-indigo-200/80 text-xs mt-0.5 leading-snug">
                  Photo 5 objects. Discover hidden connections!
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-yellow-300 text-xs font-bold">+200 XP</span>
                  <span className="text-indigo-300/50 text-xs">•</span>
                  <span className="text-indigo-200/60 text-xs">3 min challenge</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="shrink-0 text-white/70 font-bold text-lg">→</div>
            </div>
          </motion.button>
        </section>

        {/* Mode cards grid */}

        <section className="px-5 grid grid-cols-2 gap-3">
          {MODE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(card.screen)}
                className={`rounded-2xl p-4 flex flex-col justify-between min-h-[140px] shadow-lg border-2 border-transparent bg-gradient-to-b ${card.bg} ${card.border} transition-all relative group overflow-hidden`}
              >
                <div
                  className="size-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: card.color + '20', border: `1px solid ${card.color}30` }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <div className="text-left">
                  <h4 className="font-display text-base font-bold text-white">{card.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{card.desc}</p>
                </div>
                <div className="absolute top-3 right-3 text-xl opacity-40 group-hover:opacity-70 transition-opacity">
                  {card.emoji}
                </div>
              </motion.button>
            );
          })}
        </section>

        {/* Exam Predictor banner */}
        <section className="px-5 mt-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('exam-predictor')}
            className="w-full bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-snap-orange/10 border border-yellow-400/30 rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="size-12 rounded-xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center shrink-0">
              <Target className="text-yellow-400 w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-display font-bold text-white">Exam Predictor 🎯</h4>
              <p className="text-xs text-slate-400">Board exam ke top topics predict karo!</p>
            </div>
            <ChevronRight className="text-yellow-400 w-5 h-5 shrink-0" />
          </motion.button>
        </section>

        {/* Stats strip */}
        <section className="mt-6 px-5">
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-primary">{appState.snapsCount}</p>
              <p className="text-slate-400 text-xs mt-0.5">Objects Snapped</p>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-snap-orange">{appState.experimentsCount}</p>
              <p className="text-slate-400 text-xs mt-0.5">Experiments</p>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-yellow-400">{appState.badges.length}</p>
              <p className="text-slate-400 text-xs mt-0.5">Badges</p>
            </div>
          </div>
        </section>

        {/* Level card */}
        <section className="px-5 mt-4 mb-4">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-400 w-5 h-5" />
                <span className="font-display font-bold text-white">Level {level} — {levelName}</span>
              </div>
              <button
                onClick={() => navigate('profile')}
                className="text-xs text-primary font-bold flex items-center gap-1"
              >
                View <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                style={{ width: `${Math.min((appState.xp % 1000) / 10, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{appState.xp} XP total</p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-deep-navy/90 backdrop-blur-2xl border-t border-white/5 px-4 pt-3 pb-8 flex justify-around items-center z-50 max-w-md mx-auto">
        <button
          onClick={() => navigate('home')}
          className="flex flex-col items-center gap-1.5 text-primary"
        >
          <div className="relative">
            <Home className="w-6 h-6 fill-current" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
          </div>
          <span className="text-[11px] font-bold">Ghar</span>
        </button>

        <button
          onClick={() => navigate('camera')}
          className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-primary transition-colors"
        >
          <Camera className="w-6 h-6" />
          <span className="text-[11px] font-medium">Snap</span>
        </button>

        {/* FAB - DIY */}
        <button
          onClick={() => navigate('diy-picker')}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="size-12 -mt-8 bg-gradient-to-tr from-snap-orange to-yellow-400 rounded-2xl flex items-center justify-center shadow-xl shadow-snap-orange/30 border-4 border-deep-navy">
            <Plus className="text-deep-navy w-6 h-6 font-bold" />
          </div>
          <span className="text-[11px] font-medium text-slate-500">DIY</span>
        </button>

        <button
          onClick={() => navigate('exam-predictor')}
          className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-yellow-400 transition-colors"
        >
          <Target className="w-6 h-6" />
          <span className="text-[11px] font-medium">Exam</span>
        </button>

        <button
          onClick={() => navigate('profile')}
          className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-primary transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-[11px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}
