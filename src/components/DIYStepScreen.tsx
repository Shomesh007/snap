import React, { useRef, useEffect, useState } from 'react';
import { X, CheckCircle2, Camera, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState } from '../store/appStore';

interface Props {
  onBack: () => void;
  onComplete: () => void;
  appState: AppState;
  setAppState: (s: AppState) => void;
}

export default function DIYStepScreen({ onBack, onComplete, appState, setAppState }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showFriendMsg, setShowFriendMsg] = useState(false);

  const experiment = appState.diyExperiment;

  useEffect(() => {
    let s: MediaStream | null = null;
    async function startCamera() {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') return;
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch { }
    }
    startCamera();
    return () => { s?.getTracks().forEach(t => t.stop()); };
  }, []);

  const currentStep = experiment?.steps[currentStepIdx];
  const totalSteps = experiment?.steps.length || 4;

  const handleStepComplete = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStepIdx);
    setCompletedSteps(newCompleted);
    setShowFriendMsg(true);

    // Speak friend comment
    if (currentStep?.friendComment) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStep.friendComment);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      setShowFriendMsg(false);
      if (currentStepIdx < totalSteps - 1) {
        setCurrentStepIdx(prev => prev + 1);
      } else {
        // All steps done — update appState with XP + experiments count
        const newState = {
          ...appState,
          xp: appState.xp + (experiment?.xpEarned ?? 150),
          experimentsCount: appState.experimentsCount + 1,
        };
        setAppState(newState);
        onComplete();
      }
    }, 1800);
  };

  // Fallback if no experiment loaded
  if (!experiment) {
    return (
      <div className="h-screen bg-deep-navy flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-4">🧪</div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Experiment Load Ho Raha Hai...</h2>
        <p className="text-slate-400 mb-6">Please wait ya pehle wapas jaake scan karo!</p>
        <button onClick={onBack} className="px-6 py-3 bg-primary text-deep-navy rounded-2xl font-bold">
          Wapas Jao
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark">
      {/* Camera feed (top portion) */}
      <div className="relative h-[40%] w-full bg-slate-900">
        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/50 via-transparent to-background-dark/60" />

        {/* Corner brackets */}
        <div className="absolute inset-[15%] border border-dashed border-snap-orange/40 rounded-xl" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button onClick={onBack} className="size-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <X className="text-white w-5 h-5" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <span className="text-white text-sm font-bold">{experiment.experimentTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-snap-orange/20 border border-snap-orange/30">
            <span className="text-snap-orange font-bold text-xs">+{experiment.xpEarned} XP</span>
          </div>
        </div>

        {/* Friend message overlay */}
        <AnimatePresence>
          {showFriendMsg && currentStep?.friendComment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-primary/90 backdrop-blur-md rounded-2xl p-4 border border-primary/20"
            >
              <p className="text-deep-navy font-bold text-base text-center">{currentStep.friendComment}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Steps content */}
      <div className="flex-1 bg-background-dark overflow-y-auto flex flex-col">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 py-4">
          {experiment.steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${i === currentStepIdx ? 'w-8 h-2 bg-snap-orange' :
                  completedSteps.has(i) ? 'w-2 h-2 bg-primary' :
                    'w-2 h-2 bg-white/20'
                }`}
            />
          ))}
        </div>

        <div className="px-6 flex flex-col flex-1">
          {/* Step badge */}
          <div className="inline-flex self-center items-center gap-2 px-4 py-1.5 rounded-full bg-snap-orange/20 border border-snap-orange/30 mb-4">
            <span className="text-snap-orange font-bold text-sm">Step {currentStepIdx + 1} / {totalSteps}</span>
          </div>

          {/* Instruction */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center gap-4 flex-1"
            >
              <h1 className="font-display text-xl font-bold text-white leading-snug">
                {currentStep?.instruction}
              </h1>

              {/* Expected observation hint */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Expected Result:</p>
                <p className="text-slate-200 text-sm">{currentStep?.expectedObservation}</p>
              </div>

              {/* Camera action prompt */}
              <div className="w-full flex items-center gap-3 bg-snap-orange/10 border border-snap-orange/20 rounded-2xl p-3">
                <Camera className="text-snap-orange w-5 h-5 shrink-0" />
                <p className="text-snap-orange text-sm font-medium">
                  {currentStep?.cameraAction === 'verify_color_change' && 'Camera mein dekho — color change observe karo!'}
                  {currentStep?.cameraAction === 'verify_color' && 'Color note karo — AI verify karega!'}
                  {currentStep?.cameraAction === 'verify_no_change' && 'Kya badla? Camera mein dekho!'}
                  {!currentStep?.cameraAction && 'Dhyan se observe karo!'}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Complete step button */}
        <div className="p-6 flex-shrink-0">
          <button
            onClick={handleStepComplete}
            disabled={showFriendMsg}
            className="w-full flex items-center justify-center gap-3 bg-snap-orange text-white h-16 rounded-2xl font-display font-bold text-lg shadow-[0_4px_0_#C47B32] active:translate-y-1 active:shadow-none transition-all disabled:opacity-60"
          >
            <CheckCircle2 className="w-6 h-6" />
            {currentStepIdx < totalSteps - 1 ? 'Sahi! Agla Step →' : 'Experiment Complete!! 🎉'}
          </button>
        </div>
      </div>
    </div>
  );
}
