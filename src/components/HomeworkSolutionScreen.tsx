import React, { useState } from 'react';
import { ChevronLeft, Brain, Maximize2, FunctionSquare, CheckCircle2, XCircle, Check, Stars, MessageSquare, LayoutGrid, Lock } from 'lucide-react';

interface Props {
  onBack: () => void;
  onExplainMore: () => void;
}

export default function HomeworkSolutionScreen({ onBack, onExplainMore }: Props) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <div className="bg-deep-navy font-body text-slate-100 min-h-screen pb-40 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between p-5 sticky top-0 bg-deep-navy/90 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
            <ChevronLeft className="text-white w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">Solution Found! ✨</h1>
        </div>
        <div className="flex items-center gap-2 bg-snap-purple/20 px-3 py-1.5 rounded-full border border-snap-purple/30">
          <Brain className="text-snap-purple w-4 h-4 fill-current" />
          <span className="text-snap-purple text-xs font-bold uppercase tracking-wider">AI Tutor</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-4">
        <section className="mb-8">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Your Question</p>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-snap-purple to-blue-500 rounded-2xl blur opacity-25"></div>
            <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-white/5 aspect-[4/1] flex items-center px-4">
              <img 
                alt="Cropped Question" 
                className="h-10 opacity-90" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDBYriGU0VLtrjN5NYzxiaVfWOcuA7Z_5qRbgeU8_cT6KsN2gqfF5nlqyrTSlOgTsCtb8OKn8Y8ayovKwa5t0D51kK6Ulb_I8s_Nmi9-h1p_EFWlrcUNp4lv6DWFFa7ezN3xsD5Gf4EbpJImBoiG-8WqvMN7Ru4-z5jVIKeychwUSKcOQ34n2SA22qP65BHhRIJz-Jb2mhwML66cqGwCnPc0jtHxMgsBoJrY8lf56xT3-8V5yn_P6UaqnKIZqTwbOiNwD_69gQiE5m" 
              />
              <div className="ml-auto">
                <Maximize2 className="text-slate-500 w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Step-by-Step Logic</h2>
            <span className="text-xs text-slate-400">3 Steps Total</span>
          </div>

          {/* Step 1 */}
          <div className="bg-[#1A1F35] border border-snap-purple/30 rounded-3xl p-5 mb-4 relative overflow-hidden shadow-[0_0_20px_rgba(165,94,234,0.15)]">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <FunctionSquare className="w-16 h-16" />
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 size-8 rounded-full bg-snap-purple flex items-center justify-center text-white font-display font-bold text-sm shadow-lg shadow-snap-purple/40">
                1
              </div>
              <div className="flex-1">
                <p className="text-slate-200 text-lg leading-relaxed mb-4">
                  Pehle middle term ko <span className="text-snap-purple font-bold">-5x</span> split karte hain factorize karne ke liye.
                </p>
                <div className="bg-black/30 rounded-xl p-3 font-mono text-sm text-snap-green border border-white/5 mb-4">
                  3x² - 6x + x - 2 = 0
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-medium text-slate-400">Samjha?</span>
                  <button className="flex items-center gap-2 bg-snap-green/10 text-snap-green px-4 py-1.5 rounded-full border border-snap-green/20 text-xs font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    Haan!
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1A1F35] border border-snap-purple/30 rounded-3xl p-5 mb-4 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="flex-shrink-0 size-8 rounded-full bg-snap-purple/30 border border-snap-purple/50 flex items-center justify-center text-white font-display font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <p className="text-slate-200 text-lg leading-relaxed mb-4">
                  Ab groups banao aur <span className="text-snap-purple font-bold">common factors</span> nikalo.
                </p>
                <div className="bg-black/30 rounded-xl p-3 font-mono text-sm text-snap-green border border-white/5 mb-4">
                  3x(x - 2) + 1(x - 2) = 0
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-medium text-slate-400">Samjha?</span>
                  <div className="flex gap-2">
                    <button className="size-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                      <XCircle className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="size-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                      <Check className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Answer Section */}
          <div className="relative mt-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-snap-orange to-snap-red rounded-3xl blur opacity-20"></div>
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-snap-orange/20 flex items-center justify-center text-snap-orange">
                  <Stars className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-display text-xl font-bold">Final Answer</h3>
              </div>
              
              <div className={`space-y-4 transition-all duration-500 ${isUnlocked ? '' : 'blur-md select-none'}`}>
                <p className="text-2xl font-bold text-white">x = 2 or x = -1/3</p>
                <p className="text-slate-400">The roots are real and distinct...</p>
              </div>

              {!isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-navy/40 backdrop-blur-md p-6 text-center">
                  <p className="text-sm font-bold text-white mb-4">Pehle khud try karo! Unlock the answer.</p>
                  <button 
                    onClick={() => setIsUnlocked(true)}
                    className="w-full py-4 bg-white text-deep-navy rounded-2xl font-display font-extrabold text-lg shadow-[0_8px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    Haan, try kiya! <Lock className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-deep-navy/95 backdrop-blur-2xl border-t border-white/10 p-5 z-[100] pb-8">
        <div className="max-w-md mx-auto flex gap-3">
          <button 
            onClick={onExplainMore}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-4 bg-snap-orange text-deep-navy rounded-2xl font-display font-bold shadow-[0_5px_0_#C47B32] active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 font-bold" />
              <span>Aur explain karo</span>
            </div>
          </button>
          <button className="flex-1 flex flex-col items-center justify-center gap-1 py-4 bg-snap-orange text-deep-navy rounded-2xl font-display font-bold shadow-[0_5px_0_#C47B32] active:translate-y-1 active:shadow-none transition-all">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 font-bold" />
              <span>Similar Ques Do</span>
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
}
