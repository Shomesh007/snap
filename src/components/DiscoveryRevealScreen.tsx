import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, Share2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { DiscoveryAnalysis } from '../services/snaplearnAI';

interface Props {
    photos: string[];
    analysis: DiscoveryAnalysis;
    onHome: () => void;
    onRetry: () => void;
}

// ── Confetti particle ─────────────────────────────────────────────────────────
function ConfettiPiece({ delay }: { delay: number }) {
    const colors = ['#25f4b6', '#FF6B35', '#A55EEA', '#FFD700', '#FF4757'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = `${Math.random() * 100}%`;
    return (
        <motion.div
            className="absolute top-0 w-2 h-2 rounded-sm pointer-events-none"
            style={{ left, backgroundColor: color }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 360 * (Math.random() > 0.5 ? 1 : -1) * 3 }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay, ease: 'easeIn' }}
        />
    );
}

export default function DiscoveryRevealScreen({ photos, analysis, onHome, onRetry }: Props) {
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
        new Array(analysis.quiz.length).fill(null)
    );
    const [visibleSection, setVisibleSection] = useState(0);

    // Progressive section reveal
    useEffect(() => {
        const timers = [0, 400, 800, 1200, 1600].map((delay, i) =>
            setTimeout(() => setVisibleSection(i + 1), delay)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    const answerQuiz = (qIdx: number, aIdx: number) => {
        if (quizAnswers[qIdx] !== null) return;
        setQuizAnswers(prev => {
            const next = [...prev];
            next[qIdx] = aIdx;
            return next;
        });
    };

    const correctCount = quizAnswers.filter(
        (a, i) => a === analysis.quiz[i]?.correctIndex
    ).length;

    const SUBJECT_COLORS: Record<string, string> = {
        Biology: '#25f4b6',
        Chemistry: '#FF6B35',
        Physics: '#A55EEA',
        'Environmental Science': '#FFD700',
        Geography: '#00B4D8',
        Mathematics: '#FF4757',
    };

    return (
        <div className="relative flex flex-col h-full bg-deep-navy text-slate-100 overflow-y-auto pb-28">
            {/* Confetti */}
            <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                {Array.from({ length: 28 }).map((_, i) => (
                    <ConfettiPiece key={i} delay={i * 0.08} />
                ))}
            </div>

            {/* Header */}
            <AnimatePresence>
                {visibleSection >= 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 px-5 pt-14 pb-6 bg-gradient-to-b from-deep-navy to-transparent text-center"
                    >
                        <div className="text-5xl mb-3">🎉</div>
                        <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-1">You Discovered</p>
                        <h1 className="font-display text-2xl font-bold text-white leading-tight">
                            {analysis.mainConcept}
                        </h1>
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                            {analysis.connections.subjects.map(s => (
                                <span
                                    key={s}
                                    className="px-3 py-1 rounded-full text-xs font-bold border"
                                    style={{
                                        color: SUBJECT_COLORS[s] ?? '#25f4b6',
                                        borderColor: (SUBJECT_COLORS[s] ?? '#25f4b6') + '50',
                                        background: (SUBJECT_COLORS[s] ?? '#25f4b6') + '15',
                                    }}
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-5 space-y-5">
                {/* ── Photo gallery with connection flow ── */}
                {visibleSection >= 2 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">
                            Your 5 Discoveries
                        </h2>
                        <div className="flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar">
                            {photos.map((photo, i) => (
                                <React.Fragment key={i}>
                                    <div className="shrink-0 flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/40 shadow-md shadow-primary/20">
                                            <img src={photo} alt={analysis.objects[i] ?? `Object ${i + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-[10px] text-primary font-bold mt-1 max-w-[56px] text-center leading-tight truncate">
                                            {analysis.objects[i] ?? '?'}
                                        </p>
                                    </div>
                                    {i < photos.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-primary/50 shrink-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* ── The Connection ── */}
                {visibleSection >= 3 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">
                            The Connection 🔗
                        </h2>
                        <div className="bg-gradient-to-br from-primary/15 to-emerald-500/5 border border-primary/25 rounded-2xl p-5 shadow-xl shadow-primary/10">
                            <h3 className="font-display font-bold text-white text-lg mb-2">
                                {analysis.connections.title}
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {analysis.connections.explanation}
                            </p>
                        </div>
                    </motion.section>
                )}

                {/* ── Key Insights ── */}
                {visibleSection >= 4 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">
                            Key Insights 💡
                        </h2>
                        <div className="space-y-2.5">
                            {analysis.insights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4 items-start"
                                >
                                    <span className="text-xl shrink-0">💡</span>
                                    <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* ── Quick Quiz ── */}
                {visibleSection >= 5 && analysis.quiz.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                                Quick Quiz 🎯
                            </h2>
                            {quizAnswers.every(a => a !== null) && (
                                <span className="text-xs font-bold text-primary">
                                    {correctCount}/{analysis.quiz.length} correct!
                                </span>
                            )}
                        </div>
                        <div className="space-y-5">
                            {analysis.quiz.map((q, qIdx) => {
                                const answered = quizAnswers[qIdx] !== null;
                                const chosen = quizAnswers[qIdx];
                                return (
                                    <div key={qIdx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-white font-medium text-sm mb-3">
                                            Q{qIdx + 1}. {q.question}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {q.options.map((opt, oIdx) => {
                                                const isCorrect = oIdx === q.correctIndex;
                                                const isChosen = oIdx === chosen;
                                                const showResult = answered;
                                                return (
                                                    <motion.button
                                                        key={oIdx}
                                                        whileTap={!answered ? { scale: 0.97 } : {}}
                                                        onClick={() => answerQuiz(qIdx, oIdx)}
                                                        disabled={answered}
                                                        animate={showResult && isChosen && isCorrect ? { scale: [1, 1.05, 1] } : {}}
                                                        className={`rounded-xl p-3 text-sm font-medium text-left transition-all border-2
                              ${!showResult
                                                                ? 'bg-white/5 border-white/10 text-slate-300 hover:border-primary/40 hover:text-white'
                                                                : isCorrect
                                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                                    : isChosen
                                                                        ? 'bg-red-500/20 border-red-500 text-red-300'
                                                                        : 'bg-white/5 border-white/10 text-slate-500'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {showResult && isCorrect && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />}
                                                            {showResult && isChosen && !isCorrect && <XCircle className="w-4 h-4 shrink-0 text-red-400" />}
                                                            {opt}
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.section>
                )}
            </div>

            {/* ── Fixed bottom actions ── */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-deep-navy/90 backdrop-blur-xl border-t border-white/5 p-5 z-40">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onRetry}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-slate-900 font-display font-bold text-base shadow-lg shadow-primary/25 mb-3"
                >
                    ⚡ Try Another Challenge
                </motion.button>
                <div className="flex gap-3">
                    <button
                        onClick={onHome}
                        className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back Home
                    </button>
                    <button
                        className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm flex items-center justify-center gap-2"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `SnapLearn Discovery: ${analysis.mainConcept}`,
                                    text: `I just discovered "${analysis.mainConcept}" by photographing 5 everyday objects with SnapLearn! 🎉`,
                                }).catch(() => { });
                            }
                        }}
                    >
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>
        </div>
    );
}
