import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, Image as ImageIcon, Bolt, Leaf, Camera } from 'lucide-react';

interface Props {
  onBack: () => void;
  onCapture: (image: string) => void;
}

export default function CameraScreen({ onBack, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="relative h-screen w-full bg-deep-navy overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,235,164,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,235,164,0.1)_1px,transparent_1px)] bg-[length:40px_40px] opacity-40"></div>
        
        <div className="absolute top-20 left-10 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
        <div className="absolute top-20 right-10 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
        <div className="absolute bottom-40 left-10 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
        <div className="absolute bottom-40 right-10 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
      </div>

      <nav className="relative z-20 flex items-center justify-between p-6 pt-12 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onBack} className="flex h-12 w-12 items-center justify-center rounded-full bg-background-dark/40 backdrop-blur-md text-slate-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Snap & Learn 📸</h2>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">AI Active</span>
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-background-dark/40 backdrop-blur-md text-slate-100">
          <Sparkles className="text-primary w-6 h-6" />
        </button>
      </nav>

      <div className="flex-grow"></div>

      <div className="relative z-20 bg-gradient-to-t from-black/50 to-transparent pb-12 px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-background-dark/60 backdrop-blur-xl px-6 py-2 rounded-full border border-primary/20 shadow-lg">
            <p className="text-white text-base font-medium tracking-wide flex items-center gap-2">
              <Sparkles className="text-primary w-4 h-4" /> Kuch bhi photo karo!
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-white shadow-xl">
            <ImageIcon className="w-6 h-6" />
          </button>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <button 
              onClick={capture}
              className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/90 p-1 bg-transparent overflow-hidden"
            >
              <div className="h-full w-full bg-primary rounded-full flex items-center justify-center shadow-inner">
                <Camera className="text-deep-navy w-10 h-10 font-bold" />
              </div>
            </button>
          </div>

          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-white shadow-xl">
            <Bolt className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-10 right-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-10 w-10 bg-primary/40 rounded-full blur-md"></div>
            <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-deep-navy shadow-lg">
              <Leaf className="w-6 h-6 font-bold" />
            </button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
