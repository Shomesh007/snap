import React, { useState } from 'react';
import { ArrowLeft, Target, TrendingUp, Clock, BookOpen, Flame, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../store/appStore';
import { predictExam, ExamPrediction, ExamTopic } from '../services/snaplearnAI';

interface Props {
    onBack: () => void;
    profile: UserProfile;
}

const SUBJECT_OPTIONS = [
    { id: 'science', label: 'Science 🔬', emoji: '🔬' },
    { id: 'maths', label: 'Mathematics 📐', emoji: '📐' },
    { id: 'english', label: 'English 📝', emoji: '📝' },
    { id: 'social_science', label: 'Social Science 🌍', emoji: '🌍' },
    { id: 'hindi', label: 'Hindi 📚', emoji: '📚' },
];

function ProbabilityBar({ value }: { value: number }) {
    const pct = Math.round(value * 100);
    const color = pct >= 80 ? '#25f4b6' : pct >= 60 ? '#FFD166' : '#FF6B35';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                />
            </div>
            <span className="text-xs font-bold w-8 text-right" style={{ color }}>{pct}%</span>
        </div>
    );
}

export default function ExamPredictorScreen({ onBack, profile }: Props) {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<ExamPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

    const handlePredict = async () => {
        if (!selectedSubject) return;
        setIsLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const result = await predictExam(selectedSubject, profile.grade || '10');
            setPrediction(result);
        } catch (e) {
            setError('Yaar, kuch problem aaya! Internet check kar aur phir try karo. 😅');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-deep-navy text-slate-100 overflow-y-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center gap-4 p-5 pt-12 bg-deep-navy/95 backdrop-blur-xl border-b border-white/5">
                <button onClick={onBack} className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                    <h1 className="font-display text-xl font-bold">Exam Predictor 🎯</h1>
                    <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Board Exam Pattern Analysis</p>
                </div>
            </header>

            <main className="flex-1 p-5 space-y-6 pb-10">
                {/* Intro card */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-snap-orange/5 border border-yellow-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                            <Target className="text-yellow-400 w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-white">AI Exam Intel</h2>
                            <p className="text-xs text-slate-400">Class {profile.grade || '10'} Board Pattern</p>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Yaar, AI ne past CBSE papers analyze kiye — ab ye batayega ki <span className="text-yellow-400 font-bold">kaunse topics pakka aayenge!</span> Smart prep karo, sab kuch nahi! 🧠
                    </p>
                </div>

                {/* Subject selector */}
                {!prediction && !isLoading && (
                    <>
                        <div>
                            <h3 className="font-display font-bold text-lg mb-3">Subject Choose Karo:</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {SUBJECT_OPTIONS.map(subj => (
                                    <button
                                        key={subj.id}
                                        onClick={() => setSelectedSubject(subj.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${selectedSubject === subj.id
                                                ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/8'
                                            }`}
                                    >
                                        <span className="text-2xl">{subj.emoji}</span>
                                        <span className="font-bold">{subj.label}</span>
                                        {selectedSubject === subj.id && <ChevronRight className="ml-auto w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedSubject && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handlePredict}
                                className="w-full py-5 bg-gradient-to-r from-yellow-400 to-snap-orange text-deep-navy font-display font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(255,209,102,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-3"
                            >
                                <Flame className="w-6 h-6" />
                                Predict Exam Topics!
                            </motion.button>
                        )}
                    </>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center gap-6 py-12">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">🎯</div>
                        </div>
                        <div className="text-center">
                            <p className="font-display font-bold text-xl text-white">Analyzing Past Papers... 📊</p>
                            <p className="text-slate-400 text-sm mt-2">5 years ke CBSE patterns check ho rahe hain yaar!</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                        <p className="text-red-400">{error}</p>
                        <button onClick={handlePredict} className="mt-3 px-6 py-2 bg-red-500/20 rounded-xl text-red-300 text-sm font-bold">
                            Retry karo!
                        </button>
                    </div>
                )}

                {/* Prediction results */}
                {prediction && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        {/* Study plan summary */}
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
                            <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                                <TrendingUp className="text-primary w-5 h-5" /> Smart Study Plan
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">{prediction.studyPlan.message}</p>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                    <p className="text-2xl font-display font-bold text-red-400">{prediction.studyPlan.mustDo}</p>
                                    <p className="text-xs text-slate-400 mt-1">Must Do 🔥</p>
                                </div>
                                <div className="text-center bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
                                    <p className="text-2xl font-display font-bold text-yellow-400">{prediction.studyPlan.shouldDo}</p>
                                    <p className="text-xs text-slate-400 mt-1">Should Do ⚡</p>
                                </div>
                                <div className="text-center bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-2xl font-display font-bold text-slate-300">{prediction.studyPlan.optional}</p>
                                    <p className="text-xs text-slate-400 mt-1">Optional 📌</p>
                                </div>
                            </div>
                        </div>

                        {/* Topics list */}
                        <div>
                            <h3 className="font-display font-bold text-lg mb-3">
                                Top Topics ({prediction.topTopics.length} found 📊)
                            </h3>
                            <div className="space-y-3">
                                {prediction.topTopics.map((topic, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedTopic(expandedTopic === idx ? null : idx)}
                                            className="w-full p-4 flex items-center gap-3 text-left"
                                        >
                                            {/* Rank badge */}
                                            <div className={`size-8 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 ${idx === 0 ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
                                                    idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                                                        idx === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                            'bg-white/5 text-slate-400 border border-white/10'
                                                }`}>
                                                {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="font-bold text-white text-sm truncate">{topic.topic}</span>
                                                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-bold"
                                                        style={{
                                                            background: topic.probability >= 0.8 ? 'rgba(37,244,182,0.1)' : 'rgba(255,209,102,0.1)',
                                                            color: topic.probability >= 0.8 ? '#25f4b6' : '#FFD166',
                                                        }}
                                                    >
                                                        {Math.round(topic.probability * 100)}%
                                                    </span>
                                                </div>
                                                <ProbabilityBar value={topic.probability} />
                                            </div>

                                            <div className="shrink-0 flex items-center gap-2 text-slate-400">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-white">{topic.expectedMarks}M</p>
                                                    <p className="text-[10px]">{topic.preparationTime}</p>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${expandedTopic === idx ? 'rotate-90' : ''}`} />
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {expandedTopic === idx && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                                                        {/* Key points */}
                                                        <div>
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Key Points:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {topic.keyPoints.map((pt, i) => (
                                                                    <span key={i} className="text-xs px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium">
                                                                        {pt}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Prep time */}
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="text-slate-400 w-4 h-4" />
                                                            <span className="text-slate-400">Preparation:</span>
                                                            <span className="text-white font-bold">{topic.preparationTime}</span>
                                                        </div>

                                                        {/* Friend tip */}
                                                        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
                                                            <p className="text-yellow-300 text-sm">💬 {topic.friendTip}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Try another */}
                        <button
                            onClick={() => { setPrediction(null); setSelectedSubject(null); }}
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-300 text-sm"
                        >
                            Doosra Subject Try Karo
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
