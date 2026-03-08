import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Image as ImageIcon, Bolt, Camera, AlertCircle } from 'lucide-react';

const CAMERA_HINTS = [
  'Kuch bhi photo karo! 📸',
  'Apna gaon dikhao! 🌾',
  'Koi object dhundho! 🔍',
  'Nature mein kya hai? 🌿',
  'Kitchen se kuch grab karo! 🍵',
];

interface Props {
  onBack: () => void;
  onCapture: (image: string) => void;
  error?: string | null;
}

export default function CameraScreen({ onBack, onCapture, error }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
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
        setStream(cameraStream);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraError(true);
      }
    }
    startCamera();
    return () => {
      cameraStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex(i => (i + 1) % CAMERA_HINTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
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
    <div className="relative h-screen w-full bg-deep-navy overflow-hidden flex flex-col">
      {/* Camera feed or fallback */}
      <div className="absolute inset-0 z-0">
        {hasCameraError ? (
          <div className="h-full w-full bg-gradient-to-b from-deep-navy to-background-dark flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-slate-400 text-sm">Camera access nahi mila. Gallery se photo select karo!</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover opacity-80"
          />
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,235,164,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,235,164,0.08)_1px,transparent_1px)] bg-[length:40px_40px] opacity-40" />

        {/* Corner brackets */}
        <div className="absolute top-24 left-10 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
        <div className="absolute top-24 right-10 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
        <div className="absolute bottom-44 left-10 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
        <div className="absolute bottom-44 right-10 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
      </div>

      {/* Top nav */}
      <nav className="relative z-20 flex items-center justify-between p-6 pt-12 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="flex h-12 w-12 items-center justify-center rounded-full bg-background-dark/50 backdrop-blur-md text-slate-100 border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Snap & Learn 📸</h2>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">AI Active</span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-background-dark/50 backdrop-blur-md text-slate-100 border border-white/10"
        >
          <ImageIcon className="w-6 h-6" />
        </button>
      </nav>

      <div className="flex-grow" />

      {/* Error banner */}
      {error && (
        <div className="relative z-20 mx-6 mb-4 p-3 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Bottom controls */}
      <div className="relative z-20 bg-gradient-to-t from-black/60 to-transparent pb-12 px-6">
        {/* Animated hint */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-background-dark/70 backdrop-blur-xl px-6 py-2 rounded-full border border-primary/20 shadow-lg">
            <p className="text-white text-base font-medium tracking-wide flex items-center gap-2">
              <Sparkles className="text-primary w-4 h-4" /> {CAMERA_HINTS[hintIndex]}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-12">
          {/* Gallery button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-white shadow-xl"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          {/* Shutter button */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
            <button
              onClick={capture}
              disabled={hasCameraError}
              className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/90 p-1 bg-transparent overflow-hidden disabled:opacity-50"
            >
              <div className="h-full w-full bg-primary rounded-full flex items-center justify-center shadow-inner">
                <Camera className="text-deep-navy w-10 h-10 font-bold" />
              </div>
            </button>
          </div>

          {/* Flash/bolt button */}
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-white shadow-xl">
            <Bolt className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
