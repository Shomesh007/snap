import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const STEPS = [
    { icon: '🔍', text: 'Identifying objects...' },
    { icon: '🧠', text: 'Finding connections...' },
    { icon: '📚', text: 'Creating your lesson...' },
    { icon: '🌾', text: 'Adding rural context...' },
    { icon: '✨', text: 'Almost ready...' },
];

interface Props {
    photos: string[];
}

export default function DiscoveryProcessingScreen({ photos }: Props) {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setStepIndex(i => (i + 1) % STEPS.length);
        }, 2000);
        return () => clearInterval(id);
    }, []);

    const current = STEPS[stepIndex];

    return (
        <div className="flex flex-col h-full bg-deep-navy text-slate-100 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col h-full px-5 pt-14 pb-10">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-2xl font-bold">Analyzing Your Discoveries</h1>
                    <p className="text-slate-400 text-sm mt-1">AI is finding what connects your 5 photos 🧩</p>
                </div>

                {/* 5-photo grid */}
                <div className="grid grid-cols-5 gap-2 mb-10">
                    {photos.map((photo, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                            className="aspect-square rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/10"
                        >
                            <img src={photo} alt={`Discovery ${i + 1}`} className="w-full h-full object-cover" />
                        </motion.div>
                    ))}
                </div>

                {/* Pulsing orb */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative mb-10">
                        {/* Rings */}
                        {[1, 2, 3].map(ring => (
                            <motion.div
                                key={ring}
                                className="absolute inset-0 rounded-full border border-primary/30"
                                animate={{ scale: [1, 1 + ring * 0.4], opacity: [0.6, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: ring * 0.4, ease: 'easeOut' }}
                                style={{ width: '6rem', height: '6rem', top: '50%', left: '50%', translate: '-50% -50%' }}
                            />
                        ))}

                        {/* Core orb */}
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 20px rgba(37,244,182,0.3)', '0 0 40px rgba(37,244,182,0.6)', '0 0 20px rgba(37,244,182,0.3)'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative size-24 rounded-full bg-gradient-to-tr from-primary to-emerald-300 flex items-center justify-center shadow-xl shadow-primary/40"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={stepIndex}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="text-4xl"
                                >
                                    {current.icon}
                                </motion.span>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Step text */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={stepIndex}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.4 }}
                            className="font-display text-xl font-bold text-center text-white"
                        >
                            {current.text}
                        </motion.p>
                    </AnimatePresence>

                    {/* Step dots */}
                    <div className="flex gap-2 mt-6">
                        {STEPS.map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: i === stepIndex ? 1.4 : 1, opacity: i === stepIndex ? 1 : 0.3 }}
                                className="size-2 rounded-full bg-primary"
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom note */}
                <p className="text-center text-slate-500 text-xs mt-4">
                    This might take 10–15 seconds — Claude is being thorough! 🤖
                </p>
            </div>
        </div>
    );
}
