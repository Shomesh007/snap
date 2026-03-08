import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Camera, AlertCircle, Image } from 'lucide-react';

interface Props {
  onBack: () => void;
  onCapture: (image: string) => void;
  error?: string | null;
}

export default function HomeworkCaptureScreen({ onBack, onCapture, error }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraError, setHasCameraError] = useState(false);

  useEffect(() => {
    let cameraStream: MediaStream | null = null;
    async function startCamera() {
      // navigator.mediaDevices is undefined on non-HTTPS on mobile
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        console.warn('[Camera] mediaDevices not available — page may not be on HTTPS');
        setHasCameraError(true);
        return;
      }
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch {
        setHasCameraError(true);
      }
    }
    startCamera();
    return () => { cameraStream?.getTracks().forEach(t => t.stop()); };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) onCapture(evt.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative h-screen w-full bg-deep-navy flex flex-col overflow-hidden">
      {/* Camera feed */}
      <div className="absolute inset-0 z-0">
        {hasCameraError ? (
          <div className="h-full w-full bg-gradient-to-b from-deep-navy to-background-dark flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-slate-400 text-sm">Gallery se homework ka photo upload karo!</p>
            </div>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover opacity-70" />
        )}

        {/* Document frame overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-[10%] border-2 border-dashed border-snap-purple/50 rounded-2xl" />
          <div className="absolute top-[10%] left-[10%] w-6 h-6 border-t-3 border-l-3 border-snap-purple rounded-tl-lg" />
          <div className="absolute top-[10%] right-[10%] w-6 h-6 border-t-3 border-r-3 border-snap-purple rounded-tr-lg" />
          <div className="absolute bottom-[10%] left-[10%] w-6 h-6 border-b-3 border-l-3 border-snap-purple rounded-bl-lg" />
          <div className="absolute bottom-[10%] right-[10%] w-6 h-6 border-b-3 border-r-3 border-snap-purple rounded-br-lg" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
      </div>

      {/* Top nav */}
      <nav className="relative z-20 flex items-center justify-between p-5 pt-12">
        <button onClick={onBack} className="size-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-white">Homework Helper 📚</h1>
          <p className="text-xs text-snap-purple font-bold tracking-widest uppercase">AI Tutor Active</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="size-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
          <Image className="w-5 h-5 text-white" />
        </button>
      </nav>

      {/* Center tip */}
      <div className="relative z-20 flex-1 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-md border border-snap-purple/30 rounded-2xl px-5 py-3 text-center mx-8">
          <BookOpen className="text-snap-purple w-6 h-6 mx-auto mb-2" />
          <p className="text-white text-sm font-medium">Homework ka question frame mein rakh! 📄</p>
          <p className="text-slate-400 text-xs mt-1">AI step-by-step guide karega — answer nahi dega!</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="relative z-20 mx-5 mb-4 p-3 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Bottom controls */}
      <div className="relative z-20 pb-12 px-6">
        <div className="flex items-center justify-center gap-10">
          <button onClick={() => fileInputRef.current?.click()} className="size-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <Image className="w-6 h-6" />
          </button>

          {/* Capture button */}
          <div className="relative">
            <div className="absolute inset-0 bg-snap-purple/30 rounded-full blur-xl animate-pulse" />
            <button
              onClick={capture}
              disabled={hasCameraError}
              className="relative size-24 rounded-full border-4 border-white/80 bg-transparent flex items-center justify-center overflow-hidden disabled:opacity-50"
            >
              <div className="w-full h-full bg-snap-purple rounded-full flex items-center justify-center">
                <Camera className="text-white w-10 h-10" />
              </div>
            </button>
          </div>

          <div className="size-14" /> {/* spacer */}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Tap to capture • Gallery se bhi upload ho sakta hai
        </p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileInput} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
