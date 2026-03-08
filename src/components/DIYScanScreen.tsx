import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, Camera } from 'lucide-react';
import { AppState } from '../store/appStore';
import { scanEnvironmentForDIY } from '../services/snaplearnAI';
import { motion } from 'motion/react';

interface Props {
  onBack: () => void;
  onStart: () => void;
  profile: AppState['profile'];
  concept: string;              // received directly from DIYPickerScreen via App
  appState: AppState;
  setAppState: (s: AppState) => void;
}

export default function DIYScanScreen({ onBack, onStart, profile, concept, appState, setAppState }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    let s: MediaStream | null = null;
    async function startCamera() {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        setHasCameraError(true);
        return;
      }
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch {
        setHasCameraError(true);
      }
    }
    startCamera();
    return () => { s?.getTracks().forEach(t => t.stop()); };
  }, []);

  const captureAndScan = async () => {
    let imageDataUrl: string | null = null;

    if (!hasCameraError && videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0);
        imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.75);
      }
    }

    if (!imageDataUrl) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const result = await scanEnvironmentForDIY(imageDataUrl, concept, profile);
      setAppState({ ...appState, diyExperiment: result });
      onStart();
    } catch {
      setScanError('Yaar, photo clearly nahi aaya! Try again karo. 📷');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (!evt.target?.result) return;
      setIsScanning(true);
      setScanError(null);
      try {
        const result = await scanEnvironmentForDIY(evt.target.result as string, concept, profile);
        setAppState({ ...appState, diyExperiment: result });
        onStart();
      } catch {
        setScanError('Yaar, photo clearly nahi aayo! Again try karo. 📷');
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="relative flex h-screen w-full flex-col bg-background-dark overflow-hidden">
      {/* Camera feed */}
      <div className="absolute inset-0 z-0">
        {hasCameraError ? (
          <div className="h-full w-full bg-gradient-to-b from-deep-navy to-background-dark flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-slate-400 text-sm">Gallery se apne kitchen ka photo upload karo!</p>
            </div>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover opacity-80" />
        )}

        {/* Scanning grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,107,53,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,107,53,0.1)_1px,transparent_1px)] bg-[length:40px_40px] opacity-50" />
        <div className="absolute top-[40%] w-full h-0.5 bg-gradient-to-r from-transparent via-snap-orange/60 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      </div>

      {/* Top nav */}
      <div className="relative z-40 flex items-center bg-black/30 backdrop-blur-md p-4 pt-12 gap-4">
        <button onClick={onBack} className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-white text-base font-bold">Apni ki/ghar dikhao! 👀</h2>
          <p className="text-snap-orange text-[10px] uppercase font-semibold tracking-widest">
            Concept: {concept}
          </p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom sheet */}
      <div className="relative z-50 bg-background-dark rounded-t-3xl border-t border-snap-orange/20 shadow-2xl">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-display font-bold text-white mb-2">
            Scan Your Kitchen 🔍
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            Camera se apna ghar/kitchen dikhao — AI available items dhundh ke safe experiment design karega!
          </p>

          {scanError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {scanError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0"
            >
              <Camera className="w-6 h-6" />
            </button>

            <button
              onClick={captureAndScan}
              disabled={isScanning}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-snap-orange text-white font-display font-bold text-base rounded-2xl shadow-xl shadow-snap-orange/20 disabled:opacity-60 transition-opacity"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Scan Ho Raha Hai...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Scan & Design Experiment!
                </>
              )}
            </button>
          </div>

          <p className="text-center text-slate-500 text-xs mt-3">
            AI will find materials and design a safe experiment!
          </p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileInput} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
