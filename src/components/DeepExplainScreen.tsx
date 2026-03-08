import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, BookOpen, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { UserProfile } from '../types';
import { HomeworkResult } from '../store/appStore';
import { deepExplainHomework, synthesizeSpeech } from '../services/snaplearnAI';

interface ConversationMsg { role: 'ai' | 'user'; text: string; }

const FOLLOWUP_PROMPTS = [
  'Ye step kyon zaruri hai? 🤔',
  'Simplify it more! ✨',
  'Ek real life example de! 📝',
];

interface Props {
  onBack: () => void;
  profile: UserProfile;
  result: HomeworkResult | null;
}

export default function DeepExplainScreen({ onBack, profile, result }: Props) {
  const [conversation, setConversation] = useState<ConversationMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasLoaded = useRef(false);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const speakAndShow = async (voice: string, display: string, newConv: ConversationMsg[]) => {
    setDisplayText(display);
    setConversation(newConv);
    setIsPlaying(true);
    try {
      const url = await synthesizeSpeech(voice, 'Kajal', 'hi-IN', false);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); audioRef.current = null; };
      audio.play().catch(() => setIsPlaying(false));
    } catch {
      setIsPlaying(false);
    }
  };

  // Auto-explain on first mount
  useEffect(() => {
    if (hasLoaded.current || !result) return;
    hasLoaded.current = true;
    setIsLoading(true);
    deepExplainHomework(result, null, [], profile)
      .then(({ voice, display }) => speakAndShow(voice, display, [{ role: 'ai', text: display }]))
      .catch(() => setDisplayText('• Thoda wait karo yaar!\n❓ Server se connect ho raha hoon, retry kar!'))
      .finally(() => setIsLoading(false));
  }, [result]);

  const handleFollowUp = async (question: string) => {
    if (isLoading || isPlaying || !result) return;
    stopAudio();
    setIsLoading(true);
    const updatedConv: ConversationMsg[] = [...conversation, { role: 'user', text: question }];
    try {
      const { voice, display } = await deepExplainHomework(result, question, conversation, profile);
      await speakAndShow(voice, display, [...updatedConv, { role: 'ai', text: display }]);
    } catch {
      setDisplayText('• Yaar, network check karo!\n❓ Phir se try karo!');
    } finally {
      setIsLoading(false);
    }
  };

  const displayLines = displayText.split('\n').filter(Boolean);
  const statusLabel = isLoading ? 'Thinking...' : isPlaying ? 'AI Speaking...' : displayText ? 'Tap for follow-up' : 'Loading...';
  const statusColor = isLoading ? 'text-yellow-400' : isPlaying ? 'text-snap-green' : 'text-slate-500';
  const dotColor = isLoading ? 'bg-yellow-400 animate-pulse' : isPlaying ? 'bg-snap-green animate-pulse' : 'bg-slate-600';

  return (
    <div className="bg-deep-navy font-body text-slate-100 h-screen overflow-hidden flex flex-col">
      <header className="flex items-center justify-between p-5 sticky top-0 bg-deep-navy/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { stopAudio(); onBack(); }}
            className="size-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-display font-bold leading-tight">Deep Explain</h2>
            <div className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${dotColor}`} />
              <span className={`text-[10px] font-bold tracking-widest uppercase ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-snap-purple/20 text-snap-purple px-3 py-1 rounded-full text-xs font-bold border border-snap-purple/30">
          PRO MODE
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 overflow-y-auto pb-10">
        {/* Audio bars */}
        <div className="flex items-end justify-center gap-1.5 h-20 my-8">
          {[0.1, 0.3, 0.2, 0.5, 0.4, 0.6, 0.2, 0.4, 0.1].map((delay, i) => (
            <motion.div
              key={i}
              initial={{ height: 8 }}
              animate={{ height: isPlaying ? [8, 60, 8] : isLoading ? [8, 22, 8] : 8 }}
              transition={{ duration: 1.2, repeat: isPlaying || isLoading ? Infinity : 0, delay, ease: 'easeInOut' }}
              className="w-1.5 rounded-full bg-gradient-to-t from-snap-purple to-snap-green"
            />
          ))}
        </div>

        {/* Subject / chapter chips — from live result */}
        {result && (
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-snap-purple/15 border border-snap-purple/25 rounded-full text-xs font-bold text-snap-purple">
              {result.subject}
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
              {result.chapter}
            </span>
          </div>
        )}

        {/* Live AI bullet cards */}
        <AnimatePresence mode="wait">
          {displayLines.length > 0 ? (
            <motion.div
              key={displayText.slice(0, 30)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 mb-6"
            >
              {displayLines.map((line, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
                    line.startsWith('❓')
                      ? 'bg-yellow-400/10 border border-yellow-400/20 text-yellow-300'
                      : 'bg-white/5 border border-white/10 text-slate-200'
                  }`}
                >
                  {line}
                </div>
              ))}
            </motion.div>
          ) : isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 h-12 animate-pulse" />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Follow-up buttons */}
        <section className="space-y-3 mt-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ask Follow-up</p>
          <div className="flex flex-wrap gap-2">
            {FOLLOWUP_PROMPTS.map(q => (
              <button
                key={q}
                onClick={() => handleFollowUp(q)}
                disabled={isLoading || isPlaying}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </section>

        {/* Related concept — from live AI, not hardcoded */}
        {result?.relatedConcept && (
          <div className="relative overflow-hidden rounded-[24px] p-[1px] bg-gradient-to-r from-snap-green via-snap-purple to-snap-orange mt-6">
            <div className="bg-deep-navy rounded-[23px] p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-snap-green/10 flex items-center justify-center text-snap-green border border-snap-green/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-snap-green font-bold tracking-widest uppercase">Ye concept bhi jaan!</p>
                  <h4 className="font-display text-base text-white">{result.relatedConcept.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{result.relatedConcept.connectsTo}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollowUp(`Tell me about ${result.relatedConcept!.title}`)}
                disabled={isLoading || isPlaying}
                className="size-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 disabled:opacity-40"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="fixed top-1/4 -right-20 size-80 bg-snap-purple/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-1/4 -left-20 size-80 bg-snap-green/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
