import React from 'react';
import { ChevronLeft, Mic, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onBack: () => void;
}

export default function DeepExplainScreen({ onBack }: Props) {
  return (
    <div className="bg-deep-navy font-body text-slate-100 h-screen overflow-hidden flex flex-col">
      <header className="flex items-center justify-between p-5 sticky top-0 bg-deep-navy/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="size-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-display font-bold leading-tight">Deep Explain</h2>
            <div className="flex items-center gap-1.5">
              <span className="size-2 bg-snap-green rounded-full animate-pulse"></span>
              <span className="text-snap-green text-[10px] font-bold tracking-widest uppercase">AI Speaking...</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-snap-purple/20 text-snap-purple px-3 py-1 rounded-full text-xs font-bold border border-snap-purple/30">
            PRO MODE
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto flex-1 flex flex-col px-6 overflow-y-auto no-scrollbar">
        <section className="flex-1 flex flex-col items-center justify-center py-10 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-48 rounded-full border border-snap-purple/20 animate-[ping_3s_linear_infinite]"></div>
            <div className="size-64 rounded-full border border-snap-green/10 animate-[ping_4s_linear_infinite]"></div>
          </div>

          <div className="flex items-end gap-1.5 h-20 mb-8 relative z-10">
            {[0.1, 0.3, 0.2, 0.5, 0.4, 0.6, 0.2, 0.4, 0.1].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ height: 20 }}
                animate={{ height: [20, 60, 20] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut"
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-snap-purple to-snap-green"
              />
            ))}
          </div>

          <div className="text-center space-y-2 relative z-10">
            <h3 className="font-display text-xl text-white">"Toh basically, hum yahan LHS ko expand kar rahe hain..."</h3>
            <p className="text-slate-400 text-sm">Tap the mic to interrupt</p>
          </div>
        </section>

        <section className="space-y-6 pb-32">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ask Follow-up</p>
            <div className="flex flex-wrap gap-2">
              <button className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">Ye step kyon? 🤔</span>
              </button>
              <button className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">Simplify it more! ✨</span>
              </button>
              <button className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">Ek example aur? 📝</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] p-[1px] bg-gradient-to-r from-snap-green via-snap-purple to-snap-orange">
            <div className="bg-deep-navy rounded-[23px] p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-snap-green/10 flex items-center justify-center text-snap-green border border-snap-green/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-snap-green font-bold tracking-widest uppercase">Ye concept bhi jaan!</p>
                  <h4 className="font-display text-lg">Linear Equations basics</h4>
                </div>
              </div>
              <button className="size-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button className="size-20 rounded-full bg-gradient-to-tr from-snap-purple to-snap-green p-[2px] shadow-[0_0_30px_rgba(165,94,234,0.4)]">
          <div className="bg-deep-navy w-full h-full rounded-full flex items-center justify-center group">
            <Mic className="w-10 h-10 text-white group-active:scale-90 transition-transform" />
          </div>
        </button>
      </div>

      <div className="fixed top-1/4 -right-20 size-80 bg-snap-purple/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-1/4 -left-20 size-80 bg-snap-green/10 blur-[100px] rounded-full pointer-events-none"></div>
    </div>
  );
}
