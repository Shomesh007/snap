import React, { useState } from 'react';
import { ChevronLeft, Brain, Maximize2, CheckCircle2, Check, XCircle, Stars, MessageSquare, Lock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HomeworkResult } from '../store/appStore';

interface Props {
  onBack: () => void;
  onExplainMore: () => void;
  result: HomeworkResult | null;
  homeworkImage: string | null;
}

export default function HomeworkSolutionScreen({ onBack, onExplainMore, result, homeworkImage }: Props) {
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set([0]));
  const [unlockedFinal, setUnlockedFinal] = useState(false);
  const [confirmedSteps, setConfirmedSteps] = useState<Set<number>>(new Set());

  const data: HomeworkResult = result || {
    questionRead: 'Teri homework detect ho rahi hai...',
    subject: 'Science',
    chapter: 'NCERT',
    friendIntro: 'Arre yaar, ye toh interesting question hai! Chal saath mein solve karte hain — seedha answer nahi dunga, par tu khud kar sakta hai, I know it! 💪',
    steps: [
      { stepNumber: 1, hint: 'Pehle problem ko dhyan se padho aur samjho kya poocha gaya hai.', concept: 'Problem Understanding', isRevealed: true },
      { stepNumber: 2, hint: 'Relevant formulas aur concepts identify karo.', concept: 'Concept Identification', isRevealed: true },
      { stepNumber: 3, hint: 'Step by step solve karo. Dhyan rakho — final answer khud calculate karo!', concept: 'Solution Steps', isRevealed: false },
    ],
  };

  const handleConfirmStep = (idx: number) => {
    const newConfirmed = new Set(confirmedSteps);
    newConfirmed.add(idx);
    setConfirmedSteps(newConfirmed);

    // Auto-reveal next step after a brief delay
    if (idx + 1 < data.steps.length) {
      setTimeout(() => {
        setRevealedSteps(prev => new Set([...prev, idx + 1]));
      }, 400);
    }
  };

  return (
    <div className="bg-deep-navy font-body text-slate-100 min-h-screen pb-40 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-5 sticky top-0 bg-deep-navy/95 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
            <ChevronLeft className="text-white w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Solution Found! ✨</h1>
        </div>
        <div className="flex items-center gap-2 bg-snap-purple/20 px-3 py-1.5 rounded-full border border-snap-purple/30">
          <Brain className="text-snap-purple w-4 h-4" />
          <span className="text-snap-purple text-xs font-bold uppercase tracking-wider">AI Tutor</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-4 space-y-6">
        {/* Subject + chapter info */}
        <div className="flex gap-3">
          <div className="flex-1 bg-snap-purple/10 border border-snap-purple/20 rounded-2xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Subject</p>
            <p className="font-bold text-snap-purple">{data.subject}</p>
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Chapter</p>
            <p className="font-bold text-white text-sm">{data.chapter}</p>
          </div>
        </div>

        {/* Question image */}
        {homeworkImage && (
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Your Question</p>
            <div className="relative group rounded-2xl border border-white/10 overflow-hidden bg-white/5 aspect-video">
              <img
                alt="Homework Question"
                className="w-full h-full object-contain"
                src={homeworkImage}
              />
              <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg">
                <Maximize2 className="text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Friend intro */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤖</span>
            <span className="text-primary font-bold text-sm">SnapLearn Says:</span>
          </div>
          <p className="text-slate-200 text-[15px] leading-relaxed">{data.friendIntro}</p>
        </div>

        {/* Question read */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Question Detected:</p>
          <p className="text-slate-100 text-sm leading-relaxed italic">"{data.questionRead}"</p>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Step-by-Step Guide</h2>
            <span className="text-xs text-slate-400">{data.steps.length} Steps Total</span>
          </div>

          <div className="space-y-4">
            {data.steps.map((step, idx) => {
              const isRevealed = revealedSteps.has(idx) || step.isRevealed;
              const isConfirmed = confirmedSteps.has(idx);
              const isLast = idx === data.steps.length - 1;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: isRevealed ? 1 : 0.3, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`border rounded-3xl p-5 relative overflow-hidden transition-all ${isRevealed
                      ? 'bg-[#1A1F35] border-snap-purple/30 shadow-[0_0_20px_rgba(165,94,234,0.1)]'
                      : 'bg-white/3 border-white/10'
                    }`}
                >
                  <div className="flex gap-4">
                    {/* Step number */}
                    <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${isConfirmed
                        ? 'bg-green-500 text-white'
                        : isRevealed
                          ? 'bg-snap-purple text-white shadow-lg shadow-snap-purple/40'
                          : 'bg-white/10 text-slate-500 border border-white/10'
                      }`}>
                      {isConfirmed ? <Check className="w-4 h-4" /> : step.stepNumber}
                    </div>

                    <div className="flex-1">
                      {isRevealed ? (
                        <>
                          <p className="text-xs text-snap-purple font-bold uppercase tracking-wider mb-2">{step.concept}</p>
                          <p className="text-slate-200 text-[15px] leading-relaxed mb-4">{step.hint}</p>

                          {step.formula && (
                            <div className="bg-black/30 rounded-xl p-3 font-mono text-sm text-primary border border-white/5 mb-4">
                              {step.formula}
                            </div>
                          )}

                          {/* Confirm / reveal action */}
                          <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <span className="text-sm text-slate-400">Samjha?</span>
                            {!isConfirmed ? (
                              <button
                                onClick={() => handleConfirmStep(idx)}
                                className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20 text-xs font-bold uppercase transition-all hover:bg-primary/20"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Haan, samjha!
                              </button>
                            ) : (
                              <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Got it!
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 py-2">
                          <Lock className="text-slate-500 w-4 h-4" />
                          <p className="text-slate-500 text-sm">Pehle wala step complete karo!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Final answer - locked until student tries */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-snap-orange to-snap-red rounded-3xl blur opacity-20" />
          <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-snap-orange/20 flex items-center justify-center text-snap-orange">
                <Stars className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-display text-xl font-bold">Final Answer</h3>
            </div>

            <AnimatePresence mode="wait">
              {unlockedFinal ? (
                <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-primary font-bold text-lg">TU NE KHUD NIKALA!! 🔥🔥🔥</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Ab apna answer ek baar aur check kar aur compare karo. Agar match kiya —
                    <span className="text-primary font-bold"> BHAI TU GENIUS HAI!!</span>
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2">
                    <p className="text-xs text-slate-400 mb-1">Pro Tip:</p>
                    <p className="text-slate-200 text-sm">
                      Exam mein steps clearly likhna — marks milte hain step-by-step working ke liye! 📝
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="locked"
                  className="flex flex-col items-center text-center gap-4"
                >
                  <div className="bg-black/30 rounded-xl p-4 w-full">
                    <p className="text-slate-500 text-sm blur-sm select-none">
                      Answer hides here yaar... khud try karo pehle!
                    </p>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">Pehle steps follow karke khud try karo!</p>
                  <button
                    onClick={() => setUnlockedFinal(true)}
                    className="w-full py-4 bg-snap-orange text-deep-navy rounded-2xl font-display font-extrabold text-base shadow-[0_5px_0_#C47B32] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    Haan, maine try kiya! <Lock className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related concept */}
        {data.relatedConcept && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-snap-orange font-bold uppercase tracking-wider mb-2">💡 {data.relatedConcept.title}</p>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">{data.relatedConcept.content}</p>
            <p className="text-xs text-slate-500">→ Connects to: <span className="text-primary">{data.relatedConcept.connectsTo}</span></p>
          </div>
        )}
      </main>

      {/* Footer actions */}
      <footer className="fixed bottom-0 left-0 right-0 bg-deep-navy/97 backdrop-blur-2xl border-t border-white/10 p-5 z-[100] pb-8">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={onExplainMore}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-snap-purple text-white rounded-2xl font-display font-bold shadow-[0_4px_0_#7B4FC7] active:translate-y-1 active:shadow-none transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Aur Explain Karo
          </button>
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl font-display font-bold text-white transition-all"
          >
            Naya Sawaal
          </button>
        </div>
      </footer>
    </div>
  );
}
