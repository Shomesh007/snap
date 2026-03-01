import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Bot, Video, MoreVertical, Keyboard, Mic, Camera, Play, Send } from 'lucide-react';
import { Message } from '../types';
import { chatWithGemini } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface Props {
  onBack: () => void;
}

export default function ChatScreen({ onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Namaste! 👋 Aaj hum photosynthesis ke baare mein baat karenge. Kya tum jaante ho plants apna khaana kaise banate hain?',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: inputText }] });

      const response = await chatWithGemini(history);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response || 'Sorry, I encountered an error.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-deep-navy">
      <header className="flex items-center bg-deep-navy/80 backdrop-blur-lg p-4 pt-10 pb-4 justify-between border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="relative">
            <div className="size-10 rounded-full bg-snap-green/20 flex items-center justify-center border border-snap-green/30">
              <Bot className="text-snap-green w-6 h-6" />
            </div>
            <div className="absolute bottom-0 right-0 size-3 bg-snap-green rounded-full border-2 border-deep-navy"></div>
          </div>
          <div>
            <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight">SnapLearn 🤖</h2>
            <p className="text-[10px] text-snap-green font-bold tracking-widest uppercase">Live Session</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Video className="text-slate-100 w-6 h-6 cursor-pointer" />
          <MoreVertical className="text-slate-100 w-6 h-6 cursor-pointer" />
        </div>
      </header>

      <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar scroll-smooth z-10">
        {['Bio', 'Chem', 'Physics', 'Maths'].map((subject, i) => (
          <div 
            key={subject}
            className={`flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 cursor-pointer ring-1 transition-all ${
              i === 0 ? 'bg-snap-green/10 border-snap-green/30 ring-snap-green/50' : 'bg-snap-orange/10 border-snap-orange/30 ring-snap-orange/30 opacity-80'
            }`}
          >
            <span className="text-lg">{['🧬', '⚗️', '⚙️', '📐'][i]}</span>
            <p className={`text-sm font-bold tracking-wide ${i === 0 ? 'text-snap-green' : 'text-snap-orange'}`}>{subject}</p>
          </div>
        ))}
      </div>

      <main ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-snap-green/20">
                <Bot className="text-snap-green w-4 h-4" />
              </div>
            )}
            <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`p-4 rounded-2xl shadow-xl border border-white/5 ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-slate-100 rounded-tr-none' 
                  : 'bg-slate-900/50 text-slate-100 rounded-tl-none border-snap-green/10'
              }`}>
                {msg.type === 'audio' ? (
                  <div className="flex items-center gap-3">
                    <Play className="text-snap-green w-5 h-5 fill-current" />
                    <div className="flex-1 flex items-center gap-1 h-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((h, i) => (
                        <div key={i} className="w-1 bg-snap-green rounded-full" style={{ height: `${Math.random() * 20 + 10}px` }}></div>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-snap-green font-bold">0:12</span>
                  </div>
                ) : (
                  <div className="markdown-body text-[15px] leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-snap-green/20">
              <Bot className="text-snap-green w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-900/50 p-4 rounded-2xl rounded-tl-none border border-snap-green/10">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-snap-green rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-snap-green rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-snap-green rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 bg-deep-navy/90 backdrop-blur-xl border-t border-white/5 z-20">
        <div className="flex items-center gap-4 max-w-sm mx-auto">
          <button className="size-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5">
            <Keyboard className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative flex items-center">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type in Hinglish..."
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-snap-green/50"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 size-10 rounded-xl bg-snap-green flex items-center justify-center text-deep-navy"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button className="size-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5">
            <Camera className="w-6 h-6" />
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-6 font-mono font-bold tracking-[0.2em] uppercase">
          Tap to talk in Hinglish
        </p>
      </footer>
    </div>
  );
}
