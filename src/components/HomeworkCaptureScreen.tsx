import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, Flashlight, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface Props {
  onBack: () => void;
  onCapture: () => void;
}

export default function HomeworkCaptureScreen({ onBack, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-deep-navy font-body text-slate-100 min-h-screen flex flex-col overflow-hidden">
      <header className="px-6 py-4 bg-deep-navy/90 backdrop-blur-md z-50 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
            <X className="text-white w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">📝 Homework Photo</h1>
        </div>
        <p className="text-slate-400 text-sm pl-14">
          Question ka photo lo — main samjhaunga! <span className="whitespace-nowrap">(Directly answer nahi dunga 😄)</span>
        </p>
      </header>

      <main className="relative flex-1 w-full bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-snap-purple/30 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(123,97,255,0.4)_100%)] pointer-events-none"></div>
        
        <div className="relative w-[85%] aspect-[4/3] max-w-sm">
          <div className="absolute inset-0 border-2 border-snap-purple/80 rounded-lg shadow-[0_0_0_4000px_rgba(10,14,26,0.7)]">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div></div>
            </div>
            {/* Crop Handles */}
            <div className="absolute -top-3 -left-3 size-6 border-4 border-snap-purple bg-white rounded-full z-20 shadow-[0_0_10px_rgba(123,97,255,0.5)]"></div>
            <div className="absolute -top-3 -right-3 size-6 border-4 border-snap-purple bg-white rounded-full z-20 shadow-[0_0_10px_rgba(123,97,255,0.5)]"></div>
            <div className="absolute -bottom-3 -left-3 size-6 border-4 border-snap-purple bg-white rounded-full z-20 shadow-[0_0_10px_rgba(123,97,255,0.5)]"></div>
            <div className="absolute -bottom-3 -right-3 size-6 border-4 border-snap-purple bg-white rounded-full z-20 shadow-[0_0_10px_rgba(123,97,255,0.5)]"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate-800 bg-white/10 backdrop-blur-sm p-4 rounded text-lg font-mono leading-relaxed select-none text-center">
              Solve for x:<br/>
              <span className="text-2xl font-bold">2x² + 5x - 3 = 0</span>
            </div>
          </div>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6">
          <button className="size-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Flashlight className="text-white w-6 h-6" />
          </button>
          <button className="size-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <RefreshCw className="text-white w-6 h-6" />
          </button>
        </div>
      </main>

      <footer className="bg-deep-navy px-8 py-10 pb-12 shrink-0 flex flex-col items-center">
        <button 
          onClick={onCapture}
          className="group relative flex flex-col items-center"
        >
          <div className="size-24 rounded-full border-4 border-snap-purple flex items-center justify-center p-1.5 transition-transform active:scale-95">
            <div className="w-full h-full rounded-full bg-snap-purple shadow-[0_0_30px_rgba(123,97,255,0.6)] flex items-center justify-center">
              <Camera className="text-white w-10 h-10 font-bold" />
            </div>
          </div>
          <span className="mt-4 font-display text-xl font-extrabold tracking-tight text-snap-purple uppercase italic">
            Ye Question Dekh!
          </span>
        </button>
        <div className="absolute left-8 bottom-16">
          <button className="flex flex-col items-center gap-1 opacity-80">
            <div className="size-12 rounded-xl border-2 border-white/20 overflow-hidden bg-slate-800">
              <img 
                alt="gallery" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLO6fnHXYngIZQ3sxADZjh5lRGBrUYFrFnas1zAVWSwE3_5_O2eG1DV-M-Y80N1_rVMaRyymHJ-f-OQzCOSLI7Bi1MRNWJY1VDQBMvoiqFOhmaYrFgDDWhCJHqp-X9AKhROXk3LypFUF2JN0E8YpJEpP7xjIp1c3yywnBSsZgz7gQOqzSRxG4ZfDq4dLjiAfDMu9vQgz7SMf52291p3pHZVz8njb3j9IRZscAnHkDj_bWsJXKvSIO-w0WzFvElbF76IJAqdnxgRCXT" 
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Gallery</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
