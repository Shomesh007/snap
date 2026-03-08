import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Bot, Send, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, UserProfile } from '../types';
import { chatWithFriend, synthesizeSpeech, sanitizeInput } from '../services/snaplearnAI';
import ReactMarkdown from 'react-markdown';

interface Props {
  onBack: () => void;
  profile: UserProfile;
}

const SUBJECT_TAGS = [
  { label: '🧬 Bio', color: '#25f4b6' },
  { label: '⚗️ Chem', color: '#FF6B35' },
  { label: '⚙️ Physics', color: '#A55EEA' },
  { label: '📐 Maths', color: '#FFD166' },
];

export default function ChatScreen({ onBack, profile }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: `Arre ${profile.name || 'yaar'}! Aa gaya! 😄 Bol — kya jaanna hai aaj? Kuch bhi pucho — science, maths, ya life ke baare mein bhi! Main yahan hoon! 🔥`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const chatHistory = messages.map(m => ({ role: m.role === 'model' ? 'model' as const : 'user' as const, text: m.text }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const raw = text || inputText;
    const msg = sanitizeInput(raw);  // trim + 2000 char cap
    if (!msg || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const updatedHistory = [...chatHistory, { role: 'user' as const, text: msg }];
      const response = await chatWithFriend(msg, updatedHistory.slice(-8), profile);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Arre yaar, kuch problem aaya! Internet check kar aur phir try karo. 😅',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Yaar, speech recognition nahi chala. Chrome use karo!');
      return;
    }

    // On mobile browsers the permission dialog is only triggered by getUserMedia,
    // NOT by SpeechRecognition.start() alone. Explicitly request mic access first.
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop()); // release immediately — only needed the grant
      } catch (e) {
        console.warn('[Chat Voice] Microphone permission denied:', e);
        alert('Microphone access allow karo settings mein!');
        return;
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // AWS Polly TTS — fires-and-forgets, never blocks UI
  const speakText = async (text: string) => {
    try {
      const audioUrl = await synthesizeSpeech(text);
      const audio = new Audio(audioUrl);
      audio.play().catch(() => { }); // ignore autoplay policy errors
    } catch {
      // Silent fallback — don't crash the chat if Polly is unavailable
    }
  };

  return (
    <div className="flex flex-col h-full bg-deep-navy">
      {/* Header */}
      <header className="flex items-center bg-deep-navy/90 backdrop-blur-lg p-4 pt-10 pb-4 justify-between border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="relative">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot className="text-primary w-6 h-6" />
            </div>
            <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-deep-navy" />
          </div>
          <div>
            <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight">SnapLearn AI 🤖</h2>
            <p className="text-[10px] text-primary font-bold tracking-widest uppercase">Always Online — Teri Madad Ke Liye</p>
          </div>
        </div>
      </header>

      {/* Subject filters */}
      <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-b border-white/5">
        {SUBJECT_TAGS.map(tag => (
          <button
            key={tag.label}
            onClick={() => handleSend(`${tag.label} ke baare mein kuch batao`)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-slate-400 bg-slate-800/50 hover:bg-white/5 transition-all"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i === messages.length - 1 ? 0 : 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'model' && (
              <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-primary/30 mt-1">
                <Bot className="text-primary w-4 h-4" />
              </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div
                className={`p-4 rounded-2xl shadow-xl border ${msg.role === 'user'
                  ? 'bg-primary/20 border-primary/20 text-white rounded-tr-sm'
                  : 'bg-slate-800/60 border-white/5 text-slate-100 rounded-tl-sm'
                  }`}
                onClick={() => msg.role === 'model' && speakText(msg.text)}
              >
                <div className="text-[15px] leading-relaxed">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'model' && <span className="ml-2 text-primary/50">🔊 tap to hear</span>}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-primary/30">
              <Bot className="text-primary w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl rounded-tl-sm border border-white/5">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input bar */}
      <footer className="p-4 pb-8 bg-deep-navy/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-3">
          {/* Voice button */}
          <button
            onClick={toggleVoice}
            className={`size-12 rounded-2xl flex items-center justify-center border transition-all ${isListening
              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hinglish mein pucho..."
              className="w-full bg-slate-800/60 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/40 pr-12 text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2 size-9 rounded-xl bg-primary flex items-center justify-center text-deep-navy disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isListening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-red-400 mt-2 font-bold"
          >
            🎙️ Sun raha hoon... bol!
          </motion.p>
        )}
      </footer>
    </div>
  );
}
