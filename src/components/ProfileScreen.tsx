import React from 'react';
import { ArrowLeft, Flame, Trophy, Star, Camera, FlaskConical, BookOpen, Video, Target, RotateCcw, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AppState, getLevelFromXP, getXPToNextLevel, LEVEL_NAMES, BADGES_CONFIG } from '../store/appStore';

interface Props {
    onBack: () => void;
    appState: AppState;
    onResetOnboarding: () => void;
}

const ACTIVITY_STATS = [
    { icon: Camera, label: 'Objects Snapped', key: 'snapsCount' as const, color: '#25f4b6' },
    { icon: FlaskConical, label: 'Experiments Done', key: 'experimentsCount' as const, color: '#FF6B35' },
    { icon: Flame, label: 'Day Streak', key: 'streak' as const, color: '#FF4757' },
];

export default function ProfileScreen({ onBack, appState, onResetOnboarding }: Props) {
    const { profile, xp, badges, snapsCount, experimentsCount, streak } = appState;
    const level = getLevelFromXP(xp);
    const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
    const { current, needed } = getXPToNextLevel(xp);
    const progressPct = needed > 0 ? Math.min((current / needed) * 100, 100) : 100;

    const stats: Record<string, number> = { snapsCount, experimentsCount, streak };

    return (
        <div className="flex flex-col h-full bg-deep-navy text-slate-100 overflow-y-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center gap-4 p-5 pt-12 bg-deep-navy/95 backdrop-blur-xl border-b border-white/5">
                <button onClick={onBack} className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="font-display text-xl font-bold">Mera Profile 👤</h1>
            </header>

            <main className="flex-1 p-5 space-y-6 pb-10">
                {/* Profile hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl translate-x-10 -translate-y-10" />

                    <div className="flex items-center gap-4 mb-5">
                        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-4xl font-display font-black text-deep-navy shadow-lg shadow-primary/30">
                            {profile.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-bold text-white">{profile.name || 'Yaar'}</h2>
                            <p className="text-primary text-sm font-bold">Class {profile.grade} • {profile.location || 'India'}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Star className="text-yellow-400 w-3.5 h-3.5 fill-current" />
                                <span className="text-yellow-400 text-xs font-bold">{levelName}</span>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress */}
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Level {level} Progress</span>
                            <span className="text-white font-display font-bold">{xp} XP Total</span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                            />
                        </div>
                        <div className="flex justify-between text-[11px] mt-1.5">
                            <span className="text-primary font-bold">{current} XP</span>
                            <span className="text-slate-400">{needed} XP to Level {level + 1}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                    {ACTIVITY_STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.key}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                            >
                                <div className="size-10 rounded-xl mx-auto flex items-center justify-center mb-2"
                                    style={{ background: stat.color + '20', border: `1px solid ${stat.color}30` }}>
                                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                </div>
                                <p className="font-display text-2xl font-bold text-white">{stats[stat.key]}</p>
                                <p className="text-slate-400 text-[10px] mt-0.5 font-medium">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Subjects */}
                {profile.subjects.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="font-display font-bold mb-3 text-sm text-slate-400 uppercase tracking-wider">Selected Subjects</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.subjects.map(s => (
                                <span key={s} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Badges */}
                <div>
                    <h3 className="font-display font-bold text-lg mb-3">My Badges 🏅</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {BADGES_CONFIG.map((badge, i) => {
                            const earned = badges.find(b => b.id === badge.id);
                            return (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.07 }}
                                    className={`rounded-2xl p-4 border transition-all ${earned
                                            ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 border-yellow-400/30'
                                            : 'bg-white/3 border-white/5'
                                        }`}
                                >
                                    <div className={`text-3xl mb-2 ${!earned && 'grayscale opacity-30'}`}>
                                        {badge.emoji}
                                    </div>
                                    <p className={`font-bold text-sm ${earned ? 'text-yellow-300' : 'text-slate-500'}`}>
                                        {badge.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
                                    {earned && (
                                        <p className="text-[10px] text-yellow-400/60 mt-1 font-bold uppercase">✓ Earned!</p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Info card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                    <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider">Account Info</h3>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-400 text-sm">Language</span>
                        <span className="text-white font-bold">{profile.language}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-400 text-sm">Location Type</span>
                        <span className="text-white font-bold">{profile.location || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400 text-sm">Class</span>
                        <span className="text-white font-bold">Class {profile.grade}</span>
                    </div>
                </div>

                {/* Reset */}
                <button
                    onClick={onResetOnboarding}
                    className="w-full flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <RotateCcw className="w-5 h-5" />
                        <span className="font-bold">Profile Reset Karo</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </main>
        </div>
    );
}
