import { useEffect, useRef, useState } from 'react';

interface UseVoiceRecognitionOptions {
  onTranscript?: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  // Store callbacks in a ref so the effect never needs to re-run when they change
  const optionsRef = useRef(options);
  useEffect(() => { optionsRef.current = options; });

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Voice] Web Speech API not supported');
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      optionsRef.current.onListeningChange?.(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t + ' ';
        else interimTranscript += t;
      }
      const combined = (finalTranscript || interimTranscript).trim();
      setTranscript(combined);
      // Only fire callback on final result to avoid mid-sentence triggers
      if (finalTranscript) optionsRef.current.onTranscript?.(combined);
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] Recognition error:', event.error);
      setIsListening(false);
      optionsRef.current.onListeningChange?.(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      optionsRef.current.onListeningChange?.(false);
    };

    recognitionRef.current = recognition;
    return () => { recognition.abort(); };
  }, []); // ← empty deps: only create recognition ONCE

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      // On mobile browsers the permission dialog is only triggered by getUserMedia,
      // NOT by SpeechRecognition.start() alone. Explicitly request mic access first
      // so the browser shows the "Allow microphone" prompt on iOS/Android.
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Immediately release the track — we only needed the permission grant
          stream.getTracks().forEach(t => t.stop());
        } catch (e) {
          console.warn('[Voice] Microphone permission denied:', e);
          return; // Don't start recognition if mic was denied
        }
      }
      try { recognitionRef.current.start(); }
      catch (e) { console.warn('[Voice] start error:', e); }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      optionsRef.current.onListeningChange?.(false);
    }
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(''),
  };
}

