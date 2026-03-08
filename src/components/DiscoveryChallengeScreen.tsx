import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, Image as ImageIcon, CheckCircle } from 'lucide-react';

const TOTAL_PHOTOS = 5;
const TIME_LIMIT = 3 * 60; // 3 minutes in seconds

const MOTIVATIONAL = [
    'Great shot! 🔥',
    'Amazing! Keep going! ⚡',
    'One more! You got this! 💪',
    'So close! Last one! 🎯',
    "That's it!! Let's go!! 🚀",
];

interface Props {
    onBack: () => void;
    onComplete: (photos: string[]) => void;
}

export default function DiscoveryChallengeScreen({ onBack, onComplete }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [photos, setPhotos] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState(false);
    const [flashVisible, setFlashVisible] = useState(false);
    const [motivMsg, setMotivMsg] = useState<string | null>(null);
    const [started, setStarted] = useState(false);
    const [lastCaptured, setLastCaptured] = useState<string | null>(null);

    // ── Camera init: get stream and save it to state ─────────────────────────
    useEffect(() => {
        let s: MediaStream | null = null;
        (async () => {
            if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
                setCameraError(true);
                return;
            }
            try {
                s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
                setStream(s);
            } catch {
                setCameraError(true);
            }
        })();
        return () => { s?.getTracks().forEach(t => t.stop()); };
    }, []);

    // ── Assign srcObject once BOTH the stream and video element exist ─────────
    // This runs when `started` changes, which is when the <video> tag mounts.
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, started]);

    // ── Countdown timer (only after challenge starts) ─────────────────────────
    useEffect(() => {
        if (!started) return;
        if (timeLeft <= 0) { handleTimeout(); return; }
        const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [started, timeLeft]);

    const handleTimeout = () => {
        // Time's up — submit whatever photos we have (or go back)
        if (photos.length > 0) onComplete(photos);
        else onBack();
    };

    // ── Capture ───────────────────────────────────────────────────────────────
    const capture = useCallback(() => {
        if (photos.length >= TOTAL_PHOTOS) return;

        let dataUrl = '';
        if (videoRef.current && canvasRef.current && !cameraError) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.width = videoRef.current.videoWidth || 640;
                canvasRef.current.height = videoRef.current.videoHeight || 480;
                ctx.drawImage(videoRef.current, 0, 0);
                dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.82);
            }
        }

        if (!dataUrl) return;

        const newPhotos = [...photos, dataUrl];
        setPhotos(newPhotos);
        setLastCaptured(dataUrl);

        // Flash animation
        setFlashVisible(true);
        setTimeout(() => setFlashVisible(false), 350);

        // Motivational message
        const msg = MOTIVATIONAL[Math.min(photos.length, MOTIVATIONAL.length - 1)];
        setMotivMsg(msg);
        setTimeout(() => setMotivMsg(null), 1800);

        if (newPhotos.length >= TOTAL_PHOTOS) {
            setTimeout(() => onComplete(newPhotos), 600);
        }
    }, [photos, cameraError, onComplete]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || photos.length >= TOTAL_PHOTOS) return;
        const reader = new FileReader();
        reader.onload = evt => {
            if (evt.target?.result) {
                const dataUrl = evt.target.result as string;
                const newPhotos = [...photos, dataUrl];
                setPhotos(newPhotos);
                setLastCaptured(dataUrl);
                const msg = MOTIVATIONAL[Math.min(photos.length, MOTIVATIONAL.length - 1)];
                setMotivMsg(msg);
                setTimeout(() => setMotivMsg(null), 1800);
                if (newPhotos.length >= TOTAL_PHOTOS) setTimeout(() => onComplete(newPhotos), 600);
            }
        };
        reader.readAsDataURL(file);
        // reset so same file can retrigger
        e.target.value = '';
    };

    // ── Timer formatting ──────────────────────────────────────────────────────
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    const timerDanger = timeLeft < 30;
    const progress = photos.length / TOTAL_PHOTOS;

    // ── Pre-start splash ──────────────────────────────────────────────────────
    if (!started) {
        return (
            <div className="flex flex-col h-full bg-deep-navy text-slate-100 overflow-y-auto">
                {/* Back button */}
                <div className="px-5 pt-12 pb-2">
                    <button
                        onClick={onBack}
                        className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pb-10 flex flex-col gap-6">
                    {/* Hero headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-5xl mb-4">🌾</div>
                        <h1 className="font-display text-3xl font-bold leading-tight text-white mb-3">
                            Learn From<br />
                            <span className="text-primary">YOUR World</span>
                        </h1>
                        <p className="text-slate-300 text-base leading-relaxed">
                            Rural textbooks show city examples you've never seen.
                            Learn from what's around you{' '}
                            <span className="text-primary font-semibold">right now.</span>
                        </p>
                    </motion.div>

                    {/* The problem → solution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="grid grid-cols-2 gap-3"
                    >
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Textbook says</p>
                            <p className="text-slate-300 text-sm leading-snug">"In a laboratory, using apparatus…"</p>
                            <p className="text-slate-500 text-xs mt-2 italic">You've never seen a lab.</p>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">SnapLearn says</p>
                            <p className="text-slate-300 text-sm leading-snug">"That neem tree outside your door…"</p>
                            <p className="text-primary/70 text-xs mt-2 italic">Now it clicks. ✓</p>
                        </div>
                    </motion.div>

                    {/* How it works — 3 steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">How it works</p>
                        <div className="space-y-3">
                            {[
                                {
                                    step: '01',
                                    icon: '📸',
                                    title: 'Photo 5 objects in your village',
                                    desc: 'Buffalo, neem tree, wheat field, hand pump — anything around you.',
                                    color: 'from-blue-500/20 to-blue-500/5',
                                    border: 'border-blue-500/20',
                                    accent: 'text-blue-400',
                                },
                                {
                                    step: '02',
                                    icon: '🧠',
                                    title: 'AI reveals hidden science connections',
                                    desc: 'Claude analyzes all 5 photos together and finds the science linking them.',
                                    color: 'from-indigo-500/20 to-indigo-500/5',
                                    border: 'border-indigo-500/20',
                                    accent: 'text-indigo-400',
                                },
                                {
                                    step: '03',
                                    icon: '🎓',
                                    title: 'Master biology, chemistry, physics — from YOUR life',
                                    desc: 'Not from a textbook. From the world you live in every day.',
                                    color: 'from-primary/20 to-primary/5',
                                    border: 'border-primary/20',
                                    accent: 'text-primary',
                                },
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 + i * 0.08 }}
                                    className={`flex gap-4 bg-gradient-to-r ${s.color} border ${s.border} rounded-2xl p-4`}
                                >
                                    <div className="shrink-0 flex flex-col items-center gap-1">
                                        <span className="text-2xl">{s.icon}</span>
                                        <span className={`text-[10px] font-display font-bold ${s.accent} opacity-60`}>{s.step}</span>
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm text-white leading-snug`}>{s.title}</p>
                                        <p className="text-slate-400 text-xs mt-1 leading-snug">{s.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Impact statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-primary/15 to-emerald-500/10 border border-primary/25 rounded-2xl p-5 text-center"
                    >
                        <p className="text-white font-display font-bold text-base leading-snug">
                            No labs. No expensive equipment.
                        </p>
                        <p className="text-primary font-bold text-sm mt-1">
                            Your village IS your classroom.
                        </p>
                    </motion.div>

                    {/* Testimonial */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex gap-3 items-start bg-white/5 border border-white/10 rounded-2xl p-4"
                    >
                        <div className="size-9 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            P
                        </div>
                        <div>
                            <p className="text-slate-200 text-sm leading-relaxed italic">
                                "Finally, science makes sense!"
                            </p>
                            <p className="text-slate-500 text-xs mt-1">— Priya, Class 9, Bihar</p>
                        </div>
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="flex flex-col gap-3 pb-4"
                    >
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setStarted(true)}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-slate-900 font-display font-bold text-sm shadow-lg shadow-primary/25"
                        >
                            Start Learning From My World →
                        </motion.button>
                        <button
                            onClick={onBack}
                            className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs font-medium"
                        >
                            Maybe later
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full bg-deep-navy overflow-hidden flex flex-col">
            {/* Camera feed */}
            <div className="absolute inset-0 z-0">
                {cameraError ? (
                    <div className="h-full w-full bg-gradient-to-b from-slate-900 to-deep-navy flex items-center justify-center">
                        <div className="text-center p-6">
                            <div className="text-6xl mb-4">📸</div>
                            <p className="text-slate-400 text-sm">Camera access nahi mila.</p>
                            <p className="text-slate-500 text-xs mt-1">Gallery se photos select karo!</p>
                        </div>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover opacity-75" />
                )}

                {/* Subtle grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,244,182,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,244,182,0.06)_1px,transparent_1px)] bg-[length:40px_40px]" />
            </div>

            {/* Flash overlay */}
            <AnimatePresence>
                {flashVisible && (
                    <motion.div
                        initial={{ opacity: 0.9 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 bg-white z-50 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* ── TOP HUD ── */}
            <div className="relative z-20 flex items-center justify-between px-5 pt-12 pb-4 bg-gradient-to-b from-black/70 to-transparent">
                {/* Back */}
                <button
                    onClick={onBack}
                    className="size-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                {/* Timer */}
                <motion.div
                    animate={timerDanger ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.7 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border font-display font-bold text-xl
            ${timerDanger
                            ? 'bg-red-500/30 border-red-500/50 text-red-300'
                            : 'bg-black/40 border-white/20 text-white'
                        }`}
                >
                    ⏱️ {mins}:{secs}
                </motion.div>

                {/* Photo counter */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                    <span className="text-primary font-display font-bold text-lg">{photos.length}</span>
                    <span className="text-slate-400 font-bold text-lg">/{TOTAL_PHOTOS}</span>
                    <span className="text-base">📸</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative z-20 px-5">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    />
                </div>
            </div>

            {/* Motivational message */}
            <AnimatePresence>
                {motivMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.9 }}
                        className="relative z-30 mx-auto mt-4 px-6 py-2.5 bg-primary/90 rounded-full shadow-xl shadow-primary/30"
                    >
                        <p className="text-slate-900 font-display font-bold text-base">{motivMsg}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-grow" />

            {/* Corner brackets */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute top-32 left-10 w-8 h-8 border-t-2 border-l-2 border-primary/70 rounded-tl-lg" />
                <div className="absolute top-32 right-10 w-8 h-8 border-t-2 border-r-2 border-primary/70 rounded-tr-lg" />
                <div className="absolute bottom-52 left-10 w-8 h-8 border-b-2 border-l-2 border-primary/70 rounded-bl-lg" />
                <div className="absolute bottom-52 right-10 w-8 h-8 border-b-2 border-r-2 border-primary/70 rounded-br-lg" />
            </div>

            {/* ── BOTTOM CONTROLS ── */}
            <div className="relative z-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-6 pb-10 px-5">
                {/* Thumbnails */}
                <div className="flex justify-center gap-2 mb-6">
                    {Array.from({ length: TOTAL_PHOTOS }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all
                ${i < photos.length ? 'border-primary shadow-md shadow-primary/40' : 'border-white/20 bg-white/5'}`}
                            animate={i === photos.length - 1 ? { scale: [1.2, 1] } : {}}
                            transition={{ type: 'spring' }}
                        >
                            {photos[i] ? (
                                <img src={photos[i]} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-slate-600 text-xs font-bold">{i + 1}</span>
                                </div>
                            )}
                            {i < photos.length && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-primary drop-shadow" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Capture controls */}
                <div className="flex items-center justify-center gap-12">
                    {/* Gallery */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photos.length >= TOTAL_PHOTOS}
                        className="size-14 rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 flex items-center justify-center text-white disabled:opacity-30"
                    >
                        <ImageIcon className="w-6 h-6" />
                    </button>

                    {/* Shutter */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={capture}
                            disabled={photos.length >= TOTAL_PHOTOS || cameraError}
                            className="relative size-24 rounded-full border-4 border-white/90 bg-transparent overflow-hidden disabled:opacity-40 flex items-center justify-center"
                        >
                            <div className="h-full w-full bg-primary rounded-full flex items-center justify-center">
                                <Camera className="text-slate-900 w-10 h-10" />
                            </div>
                        </motion.button>
                    </div>

                    {/* Remaining count */}
                    <div className="size-14 rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 flex flex-col items-center justify-center">
                        <span className="text-primary font-display font-bold text-lg leading-none">
                            {TOTAL_PHOTOS - photos.length}
                        </span>
                        <span className="text-slate-500 text-[10px] leading-none">left</span>
                    </div>
                </div>
            </div>

            {/* Hidden inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
