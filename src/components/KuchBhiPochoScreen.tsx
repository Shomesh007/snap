import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, MessageSquare, Mic, Square, ChevronLeft, Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, UserProfile } from '../types';
import { chatWithFriend, synthesizeSpeech, sanitizeInput } from '../services/snaplearnAI';
import ReactMarkdown from 'react-markdown';

interface Props {
  onBack: () => void;
  profile: UserProfile;
}

type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

const SUBJECT_TAGS = [
  { label: '🧬 Bio' },
  { label: '⚗️ Chem' },
  { label: '⚙️ Physics' },
  { label: '📐 Maths' },
];

const WAVEFORM_OPACITIES = [0.4, 0.6, 0.8, 1, 0.7, 0.9, 0.6, 0.8, 0.5, 0.7, 0.4];

export default function KuchBhiPochoScreen({ onBack, profile }: Props) {
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [timer, setTimer] = useState(0);
  const [lastUserText, setLastUserText] = useState('');
  const [lastAIText, setLastAIText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: `Arre ${profile.name || 'yaar'}! Bol — kya jaanna hai aaj? Kuch bhi pucho — science, maths, ya life ke baare mein bhi! Main yahan hoon!`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceStatusRef = useRef<VoiceStatus>('idle');
  // Always-current snapshot of messages — safe to read inside async callbacks
  const messagesRef = useRef<Message[]>(messages);

  // Keep refs in sync
  useEffect(() => { voiceStatusRef.current = voiceStatus; }, [voiceStatus]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Recording timer
  useEffect(() => {
    if (voiceStatus === 'listening') {
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [voiceStatus]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      currentAudioRef.current?.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };

  const stopListening = () => {
    recognitionRef.current?.abort();
    setVoiceStatus('idle');
  };

  // ── Strip text for TTS: remove emojis, "SnapLearn:" prefix, markdown ────
  const stripForTTS = (text: string): string => {
    return text
      // Remove "SnapLearn:" or "Friend:" prefix the model sometimes echoes
      .replace(/^(SnapLearn|Friend|AI):\s*/i, '')
      // Remove all emoji / pictograph unicode ranges
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{20E3}\u{200D}]/gu,
        ''
      )
      // Remove markdown bold/italic markers
      .replace(/[*_~`#]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // ── Core voice AI pipeline ───────────────────────────────────────────────
  // All async work is done OUTSIDE any setMessages call — React Strict Mode
  // calls state updater functions twice which would fire two API calls and
  // play two audio streams simultaneously.
  const handleVoiceQuery = useCallback(async (transcript: string) => {
    if (!transcript.trim()) { setVoiceStatus('idle'); return; }

    setLastUserText(transcript);
    setVoiceStatus('thinking');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: transcript,
      timestamp: new Date(),
    };

    // Append user message ONCE with a functional update (no side effects inside)
    setMessages(prev => [...prev, userMsg]);

    // Read history from the ref (always current, safe in async context)
    const history = [...messagesRef.current, userMsg].map(m => ({
      role: m.role === 'model' ? 'model' as const : 'user' as const,
      text: m.role === 'model' ? m.text.replace(/^(SnapLearn|Friend):\s*/i, '') : m.text,
    }));

    try {
      const response = await chatWithFriend(transcript, history.slice(-8), profile);
      // Strip any role-label prefix the model echoed
      const cleanResponse = response.replace(/^(SnapLearn|Friend|AI):\s*/i, '').trim();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanResponse,
        timestamp: new Date(),
      };
      setMessages(p => [...p, aiMsg]);
      setLastAIText(cleanResponse);
      setVoiceStatus('speaking');

      // Stop any previous audio, then synthesize and play
      stopAudio();
      const ttsText = stripForTTS(cleanResponse);
      const url = await synthesizeSpeech(ttsText, 'Kajal', 'hi-IN', false);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = () => { currentAudioRef.current = null; setVoiceStatus('idle'); };
      audio.play().catch(() => setVoiceStatus('idle'));
    } catch {
      setVoiceStatus('idle');
    }
  }, [profile]);

  // ── Start voice recognition ──────────────────────────────────────────────
  const startListening = async () => {
    if (voiceStatusRef.current !== 'idle') return;
    stopAudio();

    // Request mic permission explicitly on mobile
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach(t => t.stop());
      } catch {
        return;
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition supported nahi hai. Chat mode use karo!');
      setMode('chat');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setVoiceStatus('listening');
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      handleVoiceQuery(t);
    };
    recognition.onerror = () => setVoiceStatus('idle');
    recognition.onend = () => {
      if (voiceStatusRef.current === 'listening') setVoiceStatus('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ── Chat mode send ───────────────────────────────────────────────────────
  const handleChatSend = async (text?: string) => {
    const raw = text || inputText;
    const msg = sanitizeInput(raw);
    if (!msg || chatLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setChatLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'model' ? 'model' as const : 'user' as const,
        text: m.text,
      }));
      const response = await chatWithFriend(msg, history.slice(-8), profile);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: response, timestamp: new Date() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Arre yaar, kuch problem aaya! Try again karo. 😅',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const speakChatText = async (text: string) => {
    try {
      const url = await synthesizeSpeech(text, 'Kajal', 'hi-IN', false);
      const audio = new Audio(url);
      audio.play().catch(() => {});
    } catch {}
  };

  // ════════════════════════════════════════════════════════════════════════
  // VOICE MODE UI
  // ════════════════════════════════════════════════════════════════════════
  if (mode === 'voice') {
    const isAnimating = voiceStatus === 'listening' || voiceStatus === 'speaking';

    const statusLabel =
      voiceStatus === 'listening'
        ? 'Bol raha hoon... 🎤'
        : voiceStatus === 'thinking'
        ? 'Socha raha hoon... 🧠'
        : voiceStatus === 'speaking'
        ? 'Suno... 🔊'
        : 'Tap to Speak';

    const statusSub =
      voiceStatus === 'listening'
        ? 'Listening to your doubt'
        : voiceStatus === 'thinking'
        ? 'AI processing your question...'
        : voiceStatus === 'speaking'
        ? 'AI is answering you'
        : 'Main sun raha hoon...';

    const headerLabel =
      voiceStatus === 'listening'
        ? 'Recording'
        : voiceStatus === 'thinking'
        ? 'Thinking'
        : voiceStatus === 'speaking'
        ? 'Speaking'
        : 'AI Voice';

    return (
      <div className="relative h-full w-full bg-background-dark flex flex-col overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-deep-navy via-slate-900/80 to-background-dark" />

        {/* ── Top nav ── */}
        <div className="relative z-20 flex items-center p-4 pt-12 justify-between">
          <button onClick={onBack} className="p-2 text-slate-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            {voiceStatus === 'listening' && (
              <div className="size-2 rounded-full bg-primary animate-pulse" />
            )}
            <span
              className={`font-semibold text-sm tracking-widest uppercase ${
                voiceStatus === 'listening' ? 'text-primary' : 'text-slate-400'
              }`}
            >
              {headerLabel}
            </span>
          </div>

          {/* Chat mode toggle */}
          <button
            onClick={() => setMode('chat')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-slate-200 text-xs font-bold tracking-wide backdrop-blur-md"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
        </div>

        {/* ── Center waveform + status ── */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Waveform */}
          <div className="w-full h-44 flex items-center justify-center gap-1.5">
            {WAVEFORM_OPACITIES.map((opacity, i) => (
              <motion.div
                key={i}
                animate={isAnimating ? { height: [16, 56, 16] } : { height: 16 }}
                transition={
                  isAnimating
                    ? { duration: 1, repeat: Infinity, delay: i * 0.09 }
                    : { duration: 0.3 }
                }
                className="w-1.5 bg-primary rounded-full"
                style={{ opacity: voiceStatus === 'idle' ? 0.18 : opacity }}
              />
            ))}
          </div>

          {/* Status text */}
          <div className="text-center space-y-1.5">
            <h1 className="font-display text-3xl text-white font-bold tracking-tight">
              {statusLabel}
            </h1>
            <p className="text-primary/70 text-base font-medium">{statusSub}</p>
          </div>

          {/* Last exchange preview */}
          <AnimatePresence mode="wait">
            {(lastUserText || lastAIText) && (
              <motion.div
                key={lastUserText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="w-full space-y-2 max-w-sm"
              >
                {/* User bubble */}
                {lastUserText && (
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[90%]">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Tune pucha</p>
                      <p className="text-white text-sm leading-snug">{lastUserText}</p>
                    </div>
                    <div className="size-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Mic className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                )}

                {/* AI bubble */}
                {lastAIText && voiceStatus !== 'listening' && (
                  <div className="flex items-start gap-2">
                    <div className="size-7 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    <div className="bg-slate-800/70 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[90%]">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">AI jawab</p>
                      <p className="text-slate-200 text-sm leading-snug line-clamp-3">{lastAIText}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom controls ── */}
        <div className="relative z-20 pb-14 flex flex-col items-center gap-5">
          {/* Timer — only while recording */}
          <AnimatePresence>
            {voiceStatus === 'listening' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10"
              >
                <span className="text-white font-mono text-lg tabular-nums tracking-widest">
                  {formatTime(timer)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main button */}
          <div className="relative">
            {voiceStatus === 'listening' && (
              <div className="absolute inset-0 bg-red-500/20 rounded-full scale-125 animate-ping pointer-events-none" />
            )}
            {voiceStatus === 'idle' && (
              <div className="absolute inset-0 bg-primary/20 rounded-full scale-110 animate-pulse pointer-events-none" />
            )}

            <button
              onClick={
                voiceStatus === 'listening'
                  ? stopListening
                  : voiceStatus === 'idle'
                  ? startListening
                  : undefined
              }
              disabled={voiceStatus === 'thinking' || voiceStatus === 'speaking'}
              className={`relative size-24 rounded-full flex items-center justify-center shadow-xl transition-all disabled:opacity-60 ${
                voiceStatus === 'listening'
                  ? 'bg-red-500 shadow-red-500/40'
                  : voiceStatus === 'thinking' || voiceStatus === 'speaking'
                  ? 'bg-slate-700'
                  : 'bg-primary shadow-primary/40'
              }`}
            >
              {voiceStatus === 'listening' ? (
                <Square className="text-white w-10 h-10 fill-current" />
              ) : voiceStatus === 'thinking' ? (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              ) : voiceStatus === 'speaking' ? (
                <div className="flex gap-0.5 items-center">
                  {[1, 2, 3, 2, 1].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [h * 5, h * 14, h * 5] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.09 }}
                      className="w-1 bg-white rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <Mic className="text-deep-navy w-10 h-10" />
              )}
            </button>
          </div>

          <span className="text-white/50 font-bold text-xs tracking-widest uppercase">
            {voiceStatus === 'listening'
              ? 'Tap to Stop'
              : voiceStatus === 'thinking'
              ? 'Processing...'
              : voiceStatus === 'speaking'
              ? 'Speaking...'
              : 'Tap to Speak'}
          </span>
        </div>

        {/* Branding */}
        <div className="absolute bottom-4 w-full flex justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-2 opacity-25">
            <div className="size-5 bg-primary rounded-full flex items-center justify-center">
              <span className="text-[10px] text-deep-navy font-bold">SL</span>
            </div>
            <span className="text-white font-bold text-xs tracking-tight">SnapLearn</span>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // CHAT MODE UI (existing chat interface, slide-in from right)
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-deep-navy">
      {/* Header */}
      <header className="flex items-center bg-deep-navy/90 backdrop-blur-lg p-4 pt-10 pb-4 justify-between border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="relative">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot className="text-primary w-6 h-6" />
            </div>
            <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-deep-navy" />
          </div>
          <div>
            <h2 className="text-slate-100 text-base font-bold leading-tight tracking-tight">
              SnapLearn AI 🤖
            </h2>
            <p className="text-[10px] text-primary font-bold tracking-widest uppercase">
              Always Online
            </p>
          </div>
        </div>

        {/* Switch back to voice */}
        <button
          onClick={() => setMode('voice')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wide"
        >
          <Mic className="w-3.5 h-3.5" />
          Voice
        </button>
      </header>

      {/* Subject filter chips */}
      <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-b border-white/5">
        {SUBJECT_TAGS.map(tag => (
          <button
            key={tag.label}
            onClick={() => handleChatSend(`${tag.label} ke baare mein kuch batao`)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-slate-400 bg-slate-800/50 hover:bg-white/5 transition-all"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'model' && (
              <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-primary/30 mt-1">
                <Bot className="text-primary w-4 h-4" />
              </div>
            )}
            <div
              className={`flex flex-col gap-1 max-w-[85%] ${
                msg.role === 'user' ? 'items-end' : ''
              }`}
            >
              <div
                className={`p-4 rounded-2xl shadow-xl border ${
                  msg.role === 'user'
                    ? 'bg-primary/20 border-primary/20 text-white rounded-tr-sm'
                    : 'bg-slate-800/60 border-white/5 text-slate-100 rounded-tl-sm'
                }`}
                onClick={() => msg.role === 'model' && speakChatText(msg.text)}
              >
                <div className="text-[15px] leading-relaxed">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {msg.role === 'model' && (
                  <span className="ml-2 text-primary/50">🔊 tap to hear</span>
                )}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Loading dots */}
        {chatLoading && (
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-primary/30">
              <Bot className="text-primary w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl rounded-tl-sm border border-white/5">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input bar */}
      <footer className="p-4 pb-8 bg-deep-navy/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
              placeholder="Hinglish mein pucho..."
              className="w-full bg-slate-800/60 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/40 pr-12 text-sm"
            />
            <button
              onClick={() => handleChatSend()}
              disabled={!inputText.trim() || chatLoading}
              className="absolute right-2 size-9 rounded-xl bg-primary flex items-center justify-center text-deep-navy disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
