import React, { useState } from 'react';
import { Microscope, Beaker, Bolt, Globe, Brain, Camera, Home, ChevronRight, Check, X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SnapLearnResult } from '../store/appStore';

interface Props {
  onBack: () => void;
  onNext: () => void;
  onTakeAnother: () => void;
  capturedImage: string | null;
  result: SnapLearnResult | null;
}

const SUBJECT_TABS = [
  { key: 'biology', label: 'Bio', icon: Microscope, color: '#25f4b6', bgColor: 'rgba(37,244,182,0.1)' },
  { key: 'chemistry', label: 'Chem', icon: Beaker, color: '#FF6B35', bgColor: 'rgba(255,107,53,0.1)' },
  { key: 'physics', label: 'Physics', icon: Bolt, color: '#A55EEA', bgColor: 'rgba(165,94,234,0.1)' },
  { key: 'localContext', label: 'Local', icon: Globe, color: '#FFD166', bgColor: 'rgba(255,209,102,0.1)' },
];

export default function AnalysisScreen({ onBack, onNext, onTakeAnother, capturedImage, result }: Props) {
  const [activeTab, setActiveTab] = useState('biology');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Fallback demo result if AI result not yet available
  const data: SnapLearnResult = result || {
    objectName: 'Object',
    objectEmoji: '🔍',
    friendGreeting: 'Arre yaar!! Interesting choice!! 🔥',
    lessons: {
      biology: { title: 'Jeevavigyaan (Biology)', emoji: '🧬', content: 'Yaar, har cheez mein biology hai! Plants, animals, microbes — sab connected hain. Teri Class ki textbook mein ye sab covered hai!', ncertChapter: 'NCERT Science' },
      chemistry: { title: 'Rasayan (Chemistry)', emoji: '⚗️', content: 'Chemistry is everywhere yaar! Atoms, molecules, reactions — ye object bhi chemistry ka ek example hai.', ncertChapter: 'NCERT Chemistry' },
      physics: { title: 'Bhautiki (Physics)', emoji: '⚙️', content: 'Physics ke bina duniya nahi chalti yaar! Forces, energy — ye sab real life mein hota hai.', ncertChapter: 'NCERT Physics' },
      localContext: { title: 'Tera Gaon', emoji: '🌾', content: 'India mein ye cheez bohot important hai. Tera surroundings — ye teri sabse badi classroom hai!', ncertChapter: 'Local Context' },
    },
    quiz: { question: 'Science ke kitne branches hain?', options: ['2', '3', '4', 'Bahut saare!'], correctIndex: 3, explanation: 'HAAN YAAR!! Bahut saare branches hain — Biology, Chemistry, Physics, aur bhi bohot kuch!' },
    nextChallenge: { prompt: '📸 Ab ek aur object photo karo!', hint: 'Hint: Kuch bhi!', concept: 'Observation skills' },
    xpEarned: 50,
    badgeProgress: 'Village Scientist: 1/5',
  };

  const activeSubject = SUBJECT_TABS.find(t => t.key === activeTab);
  const lesson = data.lessons[activeTab as keyof typeof data.lessons];

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    setTimeout(() => setShowExplanation(true), 600);
  };

  return (
    <div className="relative h-screen w-full bg-background-dark overflow-hidden flex flex-col">
      {/* Background image */}
      {capturedImage && (
        <div className="absolute inset-0 z-0">
          <img className="h-full w-full object-cover opacity-30 scale-105 blur-sm" src={capturedImage} alt="Captured" />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 via-background-dark/70 to-background-dark" />
        </div>
      )}

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[88%] bg-background-dark/97 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-primary/20 flex flex-col overflow-hidden">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-10 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{data.objectEmoji}</span>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">{data.objectName}</h1>
                <span className="text-xs text-primary font-bold uppercase tracking-wider">AI Analyzed</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <Trophy className="text-yellow-400 w-4 h-4" />
              <span className="text-yellow-400 text-sm font-bold">+{data.xpEarned} XP</span>
            </div>
          </div>

          {/* Greeting */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-4">
            <p className="text-primary text-sm font-medium leading-relaxed">{data.friendGreeting}</p>
          </div>

          {/* Subject tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SUBJECT_TABS.map(tab => {
              const Icon = tab.icon;
              const hasLesson = !!data.lessons[tab.key as keyof typeof data.lessons];
              if (!hasLesson) return null;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${activeTab === tab.key
                      ? 'border-current'
                      : 'border-white/10 text-slate-400 bg-slate-800/50'
                    }`}
                  style={activeTab === tab.key ? { color: tab.color, background: tab.bgColor, borderColor: tab.color + '60' } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-36">
          {/* Lesson content */}
          <AnimatePresence mode="wait">
            {lesson && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-5">
                  <h3 className="font-display text-base font-bold text-white mb-1 flex items-center gap-2">
                    <span>{lesson.emoji}</span> {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4 border-l-2 pl-2"
                    style={{ borderColor: activeSubject?.color }}>
                    {lesson.ncertChapter}
                  </p>
                  <p className="text-slate-200 text-[15px] leading-relaxed">{lesson.content}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quiz section */}
          <div className="bg-white/5 border border-primary/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Brain className="text-primary w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold">Quick Check! 🎯</h3>
            </div>
            <p className="text-slate-200 text-sm mb-4 leading-relaxed">{data.quiz.question}</p>

            <div className="grid grid-cols-2 gap-3">
              {data.quiz.options.map((option, idx) => {
                const isCorrect = idx === data.quiz.correctIndex;
                const isSelected = quizAnswer === idx;
                const showResult = quizAnswer !== null;

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={quizAnswer !== null}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${showResult
                        ? isCorrect
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : isSelected
                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                            : 'bg-slate-800/30 border-white/5 text-slate-500'
                        : 'bg-slate-800/40 border-white/10 text-slate-200 hover:bg-primary/10 hover:border-primary/30 active:scale-95'
                      }`}
                  >
                    {showResult && isCorrect && <Check className="w-4 h-4 shrink-0" />}
                    {showResult && isSelected && !isCorrect && <X className="w-4 h-4 shrink-0" />}
                    <span className="text-center">{option}</span>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl"
              >
                <p className="text-primary text-sm font-medium leading-relaxed">{data.quiz.explanation}</p>
              </motion.div>
            )}
          </div>

          {/* Next challenge */}
          <div className="bg-gradient-to-br from-snap-orange/10 to-snap-orange/5 border border-snap-orange/20 rounded-2xl p-5">
            <h3 className="font-display text-base font-bold text-white mb-2">Next Challenge! 🚀</h3>
            <p className="text-snap-orange font-bold mb-1">{data.nextChallenge.prompt}</p>
            <p className="text-slate-400 text-xs mb-3">{data.nextChallenge.hint}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-snap-orange/70 uppercase tracking-wider">Concept:</span>
              <span className="text-[10px] text-slate-300">{data.nextChallenge.concept}</span>
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-background-dark/95 border-t border-white/5 flex gap-3">
          <button
            onClick={onBack}
            className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={onTakeAnother}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary/10 border border-primary/30 rounded-2xl text-primary font-bold text-sm"
          >
            <Camera className="w-5 h-5" />
            Aur Photo Lo!
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-3 bg-primary rounded-2xl text-deep-navy font-bold text-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
