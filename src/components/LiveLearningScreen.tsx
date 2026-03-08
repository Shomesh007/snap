import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../store/appStore';
import { getLiveCommentary, LiveCommentary, synthesizeSpeech, explainConcept, TeachMessage } from '../services/snaplearnAI';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface Props {
    onBack: () => void;
    profile: UserProfile;
    onXPEarned: (amount: number) => void;
}

export default function LiveLearningScreen({ onBack, profile, onXPEarned }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [commentary, setCommentary] = useState<LiveCommentary | null>(null);
    const [detectedLabels, setDetectedLabels] = useState<LiveCommentary[]>([]);
    const [xpThisSession, setXpThisSession] = useState(0);
    const [hasCameraError, setHasCameraError] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const seenObjectsRef = useRef<string[]>([]);
    const isAnalyzingRef = useRef(false);

    // Teach mode
    const [inTeachMode, setInTeachMode] = useState(false);
    const inTeachModeRef = useRef(false); // ref so setInterval never reads stale state
    const [teachConversation, setTeachConversation] = useState<TeachMessage[]>([]);
    const [isTeachLoading, setIsTeachLoading] = useState(false);
    const teachScrollRef = useRef<HTMLDivElement>(null);

    // Track the playing audio so we can cancel it instantly
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    // Voice
    const { isListening: micActive, transcript, startListening, stopListening, resetTranscript } = useVoiceRecognition({
        onTranscript: handleVoiceInput,
    });

    async function handleVoiceInput(text: string) {
        if (!text.trim() || isTeachLoading) return;
        resetTranscript();
        stopListening();
        if (inTeachModeRef.current && commentary?.objectDetected) {
            await continueTeach(text);
        }
    }

    // â”€â”€ Teach mode helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function stopAllAudio() {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
    }

    async function startTeachMode() {
        if (!commentary?.objectDetected) return;
        stopAllAudio();
        setInTeachMode(true);
        inTeachModeRef.current = true;
        setTeachConversation([]);
        setIsTeachLoading(true);
        try {
            const resp = await explainConcept(commentary.objectDetected, [], profile);
            const aiMsg: TeachMessage = { role: 'ai', text: resp.bullets };
            setTeachConversation([aiMsg]);
            speakText(resp.voice);  // speak the story, show the bullets
        } catch { /* silent */ }
        finally { setIsTeachLoading(false); }
    }

    async function continueTeach(userText?: string) {
        if (!commentary?.objectDetected || isTeachLoading) return;
        stopAllAudio();
        setIsTeachLoading(true);
        // Add user's spoken message to conversation for display
        const updatedWithUser: TeachMessage[] = userText
            ? [...teachConversation, { role: 'user', text: userText }]
            : teachConversation;
        if (userText) setTeachConversation(updatedWithUser);
        try {
            const resp = await explainConcept(commentary.objectDetected, updatedWithUser, profile);
            // Store bullets in history so AI has text context for next turn
            const next: TeachMessage[] = [...updatedWithUser, { role: 'ai', text: resp.bullets }];
            setTeachConversation(next);
            speakText(resp.voice);  // speak the conversational story
        } catch { /* silent */ }
        finally { setIsTeachLoading(false); }
    }

    function exitTeachMode() {
        stopAllAudio();
        setInTeachMode(false);
        inTeachModeRef.current = false;
        setTeachConversation([]);
    }

    // Always use Kajal (hi-IN) — AI responses are Hinglish in Latin script,
    // detectLanguage can't tell it apart from English. Kajal sounds natural for both.
    function speakText(text: string) {
        stopAllAudio();
        synthesizeSpeech(text, 'Kajal', 'hi-IN', true /* SSML — adds natural pauses */)
            .then(url => {
                const audio = new Audio(url);
                currentAudioRef.current = audio;
                audio.onended = () => { currentAudioRef.current = null; };
                audio.play().catch(() => { currentAudioRef.current = null; });
            })
            .catch(() => {});
    }

    // Auto-scroll teach conversation
    useEffect(() => {
        if (teachScrollRef.current) {
            teachScrollRef.current.scrollTop = teachScrollRef.current.scrollHeight;
        }
    }, [teachConversation]);

    // â”€â”€ Camera & analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const startCamera = async () => {
        // navigator.mediaDevices is undefined on non-HTTPS on mobile
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
            console.warn('[Camera] mediaDevices not available — page may not be on HTTPS');
            setHasCameraError(true);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsActive(true);
            startAnalysis();
        } catch {
            setHasCameraError(true);
        }
    };

    const captureFrame = (): string => {
        const canvas = document.createElement('canvas');
        const video = videoRef.current!;
        const scale = Math.min(1, 320 / (video.videoWidth || 320));
        canvas.width = Math.round((video.videoWidth || 320) * scale);
        canvas.height = Math.round((video.videoHeight || 240) * scale);
        canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.4);
    };

    const startAnalysis = () => {
        intervalRef.current = setInterval(async () => {
            // Use inTeachModeRef — state is stale inside setInterval closure
            if (!videoRef.current?.srcObject || isAnalyzingRef.current || inTeachModeRef.current) return;
            isAnalyzingRef.current = true;
            setIsAnalyzing(true);
            try {
                const frame = captureFrame();
                const result = await getLiveCommentary(frame, seenObjectsRef.current, profile);
                // User may have entered teach mode while API was running — bail silently
                if (inTeachModeRef.current) return;
                if (result.objectDetected && !seenObjectsRef.current.includes(result.objectDetected)) {
                    seenObjectsRef.current = [...seenObjectsRef.current, result.objectDetected];
                    setCommentary(result);
                    setDetectedLabels(prev => [...prev.slice(-4), result]);
                    speakText(result.commentary || '');
                    onXPEarned(5);
                    setXpThisSession(prev => prev + 5);
                }
            } catch (e) {
                console.error('[LiveLearning Analysis Error]', e);
            } finally {
                isAnalyzingRef.current = false;
                setIsAnalyzing(false);
            }
        }, 8000);
    };

    const stopCamera = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        seenObjectsRef.current = [];
        isAnalyzingRef.current = false;
        inTeachModeRef.current = false;
        stopAllAudio();
        stopListening();
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
        setIsActive(false);
        setIsAnalyzing(false);
        setInTeachMode(false);
        setTeachConversation([]);
        setCommentary(null);        // clear card so it doesn't show after going back
        setDetectedLabels([]);      // clear chips too
    };

    useEffect(() => { return () => { stopCamera(); }; }, []);

    // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-5 pt-12">
                <button
                    onClick={() => { stopCamera(); onBack(); }}
                    className="size-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20"
                >
                    <ArrowLeft className="text-white w-5 h-5" />
                </button>
                <div>
                    {isActive && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            <span className="text-white text-xs font-bold tracking-wider uppercase">
                                {inTeachMode ? 'LEARNING' : 'LIVE'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
                    <span className="text-yellow-400 text-xs font-bold">+{xpThisSession} XP</span>
                </div>
            </div>

            {/* Detected object chips */}
            {!inTeachMode && (
                <div className="absolute left-4 top-28 z-20 flex flex-col gap-2">
                    <AnimatePresence>
                        {detectedLabels.map((label, i) => (
                            <motion.div
                                key={`${label.objectDetected}-${i}`}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5"
                            >
                                <span className="text-sm">{label.objectEmoji}</span>
                                <span className="text-white text-xs font-medium">{label.objectDetected}</span>
                                <span className="text-slate-400 text-[10px] font-bold uppercase">{label.subject}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* â”€â”€ TEACH MODE conversation â”€â”€ */}
            <AnimatePresence>
                {inTeachMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="absolute inset-x-0 bottom-28 top-28 z-30 flex flex-col"
                    >
                        {/* Teach header */}
                        <div className="mx-4 mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{commentary?.objectEmoji}</span>
                                <div>
                                    <p className="text-white text-sm font-bold">{commentary?.objectDetected}</p>
                                    <p className="text-primary text-[10px] font-bold uppercase">{commentary?.subject}</p>
                                </div>
                            </div>
                            <button onClick={exitTeachMode} className="text-slate-400 text-xs px-3 py-1 rounded-full border border-white/20">
                                ← Wapas
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={teachScrollRef} className="flex-1 overflow-y-auto mx-4 flex flex-col gap-3 pb-2">
                            {teachConversation.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'user' ? (
                                        // User message — plain bubble
                                        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-primary/20 border border-primary/40">
                                            <p className="text-primary text-[14px] leading-relaxed">{msg.text}</p>
                                        </div>
                                    ) : (
                                        // AI message — parse bullet lines and question line
                                        <div className="max-w-[95%] flex flex-col gap-2">
                                            {msg.text.split('\n').filter(l => l.trim()).map((line, li) => {
                                                const isBullet = line.startsWith('•');
                                                const isQuestion = line.startsWith('❓');
                                                if (isBullet) return (
                                                    <div key={li} className="flex items-start gap-2 bg-black/70 border border-white/10 rounded-2xl px-3 py-2.5">
                                                        <span className="text-primary text-base mt-0.5 shrink-0">•</span>
                                                        <p className="text-white text-[13px] leading-snug">{line.replace(/^•\s*/, '')}</p>
                                                    </div>
                                                );
                                                if (isQuestion) return (
                                                    <div key={li} className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-3 py-2.5 mt-1">
                                                        <span className="text-yellow-400 text-base shrink-0">❓</span>
                                                        <p className="text-yellow-300 text-[13px] font-semibold leading-snug">{line.replace(/^❓\s*/, '')}</p>
                                                    </div>
                                                );
                                                // fallback for any plain line
                                                return <p key={li} className="text-white/70 text-[12px] px-1">{line}</p>;
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isTeachLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-black/80 border border-primary/30 rounded-2xl px-4 py-3 flex gap-1">
                                        {[0,1,2].map(i => (
                                            <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Teach actions */}
                        {!isTeachLoading && teachConversation.length > 0 && (
                            <div className="mx-4 flex gap-2 mt-2">
                                <button
                                    onClick={() => continueTeach()}
                                    className="flex-1 py-3 bg-primary/20 border border-primary/40 rounded-2xl text-primary text-sm font-bold active:scale-95 transition-transform"
                                >
                                    ➡️ Aur batao!
                                </button>
                                <button
                                    onClick={exitTeachMode}
                                    className="flex-1 py-3 bg-green-500/20 border border-green-500/40 rounded-2xl text-green-400 text-sm font-bold active:scale-95 transition-transform"
                                >
                                    ✅ Samajh gaya!
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* â”€â”€ Normal commentary bubble (only when NOT in teach mode) â”€â”€ */}
            <AnimatePresence>
                {!inTeachMode && commentary?.commentary && (
                    <motion.div
                        key={commentary.objectDetected}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-36 left-4 right-4 z-30"
                    >
                        <div className="bg-black/85 backdrop-blur-xl border border-primary/30 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <span className="text-2xl">{commentary.objectEmoji}</span>
                                    <span className="text-[10px] text-primary font-bold uppercase">{commentary.subject}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-[15px] leading-snug mb-2">{commentary.commentary}</p>
                                    {commentary.microQuestion && (
                                        <p className="text-primary text-xs font-bold mb-2">🤔 {commentary.microQuestion}</p>
                                    )}
                                    {commentary.ncertLink && (
                                        <p className="text-slate-400 text-[10px] mb-3">📚 {commentary.ncertLink}</p>
                                    )}
                                    <button
                                        onClick={startTeachMode}
                                        className="w-full py-2.5 bg-primary/15 border border-primary/40 rounded-xl text-primary text-xs font-bold active:scale-95 transition-transform"
                                    >
                                        🙋 Aur samjhao — bilkul basic se!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pb-10 flex flex-col items-center gap-4">
                {hasCameraError ? (
                    <div className="mx-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-center">
                        <p className="text-red-300 text-sm">Camera access nahi mila. Settings mein allow karo!</p>
                    </div>
                ) : !isActive ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="text-center px-8">
                            <h2 className="font-display text-2xl font-bold text-white mb-2">Live Learning 🎥</h2>
                            <p className="text-slate-400 text-sm">Apne aas-paas ghoom — AI har cheez ke baare mein batayega!</p>
                        </div>
                        <button
                            onClick={startCamera}
                            className="flex items-center gap-3 px-8 py-4 bg-red-500 text-white font-display font-bold text-lg rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.4)] active:scale-95 transition-transform"
                        >
                            🎥 Live Shuru Karo!
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-6">
                        {isAnalyzing && !inTeachMode && (
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        )}
                        {/* Mic button â€” in teach mode for asking questions, else for free questions */}
                        {(inTeachMode || commentary?.objectDetected) && !isTeachLoading && (
                            <button
                                onClick={() => { if (micActive) stopListening(); else { resetTranscript(); startListening(); } }}
                                className={`size-12 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-lg active:scale-95 ${
                                    micActive ? 'bg-blue-500 border-4 border-blue-300 animate-pulse' : 'bg-blue-600/80 border-4 border-white/40'
                                }`}
                                title={inTeachMode ? 'Apna sawaal pucho' : 'Question pucho'}
                            >
                                {micActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </button>
                        )}
                        {/* Listening indicator */}
                        {micActive && transcript && (
                            <span className="text-white/80 text-xs italic max-w-[120px] truncate">{transcript}</span>
                        )}
                        <button
                            onClick={stopCamera}
                            className="size-14 rounded-full bg-red-500/80 border-4 border-white/80 flex items-center justify-center text-white text-xl shadow-xl"
                        >
                            â¹
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
